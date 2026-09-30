// server/src/engine/rulesEngine.js
const { emiFromPrincipal, principalFromEmi, aprFromEmiAndFees } = require('./formulas');

function clamp(val, a, b) { return Math.max(a, Math.min(b, val)); }

function evaluateProfile(profile) {
  // Normalize inputs with defaults
  const p = Object.assign({}, profile);

  const employmentType = p.employmentType || 'informal';
  const netIncome = p.netMonthlyIncome || 0;
  const existingEmis = p.existingMonthlyEmis || 0;
  const spouseIncome = p.spouseMonthlyIncome || 0;
  const livingCosts = (p.monthlyLivingExpenses || p.livingExpenses || 0) + (p.rent || 0);
  const targetAmount = p.targetAmount || 0;
  const tenureMonths = p.requestedTenureMonths || 60;
  const cibil = (typeof p.cibilScore === 'number') ? p.cibilScore : null;

  // FOIR calculation (simple)
  let recognizedIncome = netIncome;
  if (employmentType === 'self_employed') {
    if (p.annualItrIncome) recognizedIncome = p.annualItrIncome / 12;
  }

  // Lender Sanction logic
  let lenderSanctionAmount = 0;
  if (employmentType === 'salaried') {
    const foirCap = 0.50;
    const allowedEmi = Math.max(0, foirCap * recognizedIncome - existingEmis);
    lenderSanctionAmount = principalFromEmi(allowedEmi, 11.5, 60); // bank uses 11.5% for estimate
  } else if (employmentType === 'self_employed') {
    if (p.ownsUnencumberedProperty) {
      lenderSanctionAmount = (p.propertyEstimatedValue || 0) * 0.5; // LAP route
    } else {
      const monthlyRecognised = (p.annualItrIncome || 0) / 12;
      const allowedEmi = Math.max(0, 0.40 * monthlyRecognised - existingEmis);
      lenderSanctionAmount = principalFromEmi(allowedEmi, 13.5, 60);
    }
  } else { // informal
    // micro cap
    lenderSanctionAmount = 100000;
    if (!cibil && p.bouncedEmiLast12m) lenderSanctionAmount = 0;
  }

  // Safe Capacity (borrower can carry)
  const netMonthlySurplus = netIncome + spouseIncome * 0.7 - livingCosts - existingEmis;
  const safeEmiCeiling = Math.max(0, netMonthlySurplus * 0.60); // keep 40% buffer
  const safeCapacityAmount = principalFromEmi(safeEmiCeiling, 11.0, tenureMonths);

  // Verdict logic
  let verdict = 'Borrow';
  if (p.bouncedEmiLast12m === true && (p.highInterestAppLoansCount || 0) > 0) {
    verdict = "Don't Borrow";
  }
  // debt obligations exceed 60% of verified income
  if (recognizedIncome > 0 && (existingEmis / recognizedIncome) >= 0.6) {
    verdict = "Don't Borrow";
  }
  // consumption/lifestyle but capacity insufficient
  const isLifestyle = ['wedding', 'consumption', 'emergency'].includes(p.loanPurpose);
  if (isLifestyle && targetAmount > safeCapacityAmount) {
    verdict = 'Borrow Less';
  }
  // productive and FOIR <=40
  if (['business_expansion', 'asset_purchase'].includes(p.loanPurpose) && ((existingEmis / recognizedIncome) <= 0.4)) {
    verdict = 'Borrow';
  }

  // Fair Rate & APR band
  const base = 8.5;
  let spreadLow = 2.0, spreadHigh = 3.0; // default for prime salaried
  if (employmentType === 'self_employed' && p.ownsUnencumberedProperty) {
    spreadLow = 1.0; spreadHigh = 2.25;
  } else if (employmentType === 'self_employed') {
    spreadLow = 5.0; spreadHigh = 7.5;
  } else if (employmentType === 'informal') {
    spreadLow = 10.0; spreadHigh = 16.0;
  }
  // widen range if cibil unknown
  if (cibil === null) { spreadLow -= 1.75; spreadHigh += 1.75; }
  const nominalLow = clamp(base + spreadLow, 0, 100);
  const nominalHigh = clamp(base + spreadHigh, 0, 100);
  // APR: include processing fee
  const processingFeePct = 1.5; // default
  const exampleTenure = tenureMonths || 60;
  const aprLow = aprFromEmiAndFees(emiFromPrincipal(targetAmount || safeCapacityAmount, nominalLow, exampleTenure), exampleTenure, targetAmount || safeCapacityAmount, processingFeePct);
  const aprHigh = aprFromEmiAndFees(emiFromPrincipal(targetAmount || safeCapacityAmount, nominalHigh, exampleTenure), exampleTenure, targetAmount || safeCapacityAmount, processingFeePct);

  // Max Safe EMI & Tenure table (36,48,60)
  const tenures = [36, 48, 60];
  const tenureTable = tenures.map((t) => {
    const pv36 = principalFromEmi(safeEmiCeiling, 11.0, t);
    return { months: t, safeAmount: Math.round(pv36) };
  });

  // Stress scenarios
  const stressIncomeDrop = (netMonthlySurplus * 0.8) - existingEmis; // income -20%
  const stressSafeEmiAfterIncomeShock = Math.max(0, stressIncomeDrop * 0.6);
  // Allow frontend to request a specific rate hike (forcedRateHikePct) for stress testing
  const defaultBaseRate = 11.0;
  const requestedHikePct = (typeof p.forcedRateHikePct === 'number') ? p.forcedRateHikePct : 2.0; // percent
  const rateBefore = defaultBaseRate;
  const rateAfter = defaultBaseRate + requestedHikePct;
  const emiBefore = emiFromPrincipal(safeCapacityAmount, rateBefore, tenureMonths);
  const emiAfter = emiFromPrincipal(safeCapacityAmount, rateAfter, tenureMonths);
  const rateHikeEmiIncrease = Math.round(emiAfter - emiBefore);

  // Negotiation card text
  const negotiation = {
    fairRateText: `Fair rate for your profile is ${nominalLow.toFixed(2)}% - ${nominalHigh.toFixed(2)}%` + (cibil ? ` because CIBIL ${cibil}` : ' (credit score unknown)') + `.`,
    counterScript: `If lender quotes higher than ${nominalHigh.toFixed(1)}% say: 'My FOIR is under ${(existingEmis / recognizedIncome * 100).toFixed(1)}% and I have no defaults; please match top NBFC offers.'`,
    reroute: employmentType === 'self_employed' && p.ownsUnencumberedProperty ? 'Consider LAP route: lower rates and higher ticket sizes.' : 'Avoid unsecured high-cost borrowing; consider secured options if available.'
  };

  return {
    verdict,
    lenderSanctionAmount: Math.round(lenderSanctionAmount),
    safeCapacityAmount: Math.round(safeCapacityAmount),
    safeEmiCeiling: Math.round(safeEmiCeiling),
    fairRate: { nominalLow: nominalLow.toFixed(2), nominalHigh: nominalHigh.toFixed(2), aprLow: aprLow.toFixed(2), aprHigh: aprHigh.toFixed(2) },
    tenureTable,
    stress: {
      incomeShock: { safeEmiAfterIncomeShock: Math.round(stressSafeEmiAfterIncomeShock) },
      rateHike: { increasedEmi: Math.round(rateHikeEmiIncrease), emiBefore: Math.round(emiBefore), emiAfter: Math.round(emiAfter), rateBefore, rateAfter }
    },
    negotiation
  };
}

module.exports = { evaluateProfile };
