// client/api/evaluate.js
// Vercel serverless endpoint evaluating a borrower profile and returning results

function emiFromPrincipal(P, annualRatePct, nMonths) {
  const r = (annualRatePct || 0) / 12 / 100;
  if (r === 0) return P / nMonths;
  const pow = Math.pow(1 + r, nMonths);
  const emi = P * r * (pow / (pow - 1));
  return Math.round(emi);
}

function principalFromEmi(EMI, annualRatePct, nMonths) {
  const r = (annualRatePct || 0) / 12 / 100;
  if (r === 0) return EMI * nMonths;
  const pow = Math.pow(1 + r, nMonths);
  const P = EMI * ( (pow - 1) / (r * pow) );
  return Math.round(P);
}

function aprFromEmiAndFees(monthlyEmi, nMonths, principal, processingFeePct) {
  const fee = (processingFeePct || 0) / 100 * principal * 1.18;
  const target = principal - fee;
  if (principal <= 0 || monthlyEmi <= 0) return 0;
  function pv(rateAnnual) {
    const r = rateAnnual / 12 / 100;
    const pv = monthlyEmi * (1 - Math.pow(1 + r, -nMonths)) / r;
    return pv;
  }
  let low = 0, high = 100, mid = 0;
  for (let i=0;i<40;i++){
    mid = (low+high)/2;
    const val = pv(mid);
    if (val > target) high = mid; else low = mid;
  }
  return parseFloat(mid.toFixed(2));
}

function clamp(val, a, b) { return Math.max(a, Math.min(b, val)); }

function evaluateProfile(p) {
  const profile = Object.assign({}, p || {});
  const employmentType = profile.employmentType || 'informal';
  const netIncome = profile.netMonthlyIncome || 0;
  const existingEmis = profile.existingMonthlyEmis || 0;
  const spouseIncome = profile.spouseMonthlyIncome || 0;
  const livingCosts = (profile.monthlyLivingExpenses || profile.livingExpenses || 0) + (profile.rent || 0);
  const targetAmount = profile.targetAmount || 0;
  const tenureMonths = profile.requestedTenureMonths || 60;
  const cibil = (typeof profile.cibilScore === 'number') ? profile.cibilScore : null;

  let recognizedIncome = netIncome;
  if (employmentType === 'self_employed' && profile.annualItrIncome) recognizedIncome = profile.annualItrIncome / 12;

  let lenderSanctionAmount = 0;
  if (employmentType === 'salaried') {
    const foirCap = 0.50;
    const allowedEmi = Math.max(0, foirCap * recognizedIncome - existingEmis);
    lenderSanctionAmount = principalFromEmi(allowedEmi, 11.5, 60);
  } else if (employmentType === 'self_employed') {
    if (profile.ownsUnencumberedProperty) {
      lenderSanctionAmount = (profile.propertyEstimatedValue || 0) * 0.5;
    } else {
      const monthlyRecognised = (profile.annualItrIncome || 0) / 12;
      const allowedEmi = Math.max(0, 0.40 * monthlyRecognised - existingEmis);
      lenderSanctionAmount = principalFromEmi(allowedEmi, 13.5, 60);
    }
  } else {
    lenderSanctionAmount = 100000;
    if (!cibil && profile.bouncedEmiLast12m) lenderSanctionAmount = 0;
  }

  const netMonthlySurplus = netIncome + spouseIncome * 0.7 - livingCosts - existingEmis;
  const safeEmiCeiling = Math.max(0, netMonthlySurplus * 0.60);
  const safeCapacityAmount = principalFromEmi(safeEmiCeiling, 11.0, tenureMonths);

  let verdict = 'Borrow';
  if (profile.bouncedEmiLast12m === true && (profile.highInterestAppLoansCount || 0) > 0) verdict = "Don't Borrow";
  if (recognizedIncome > 0 && (existingEmis / recognizedIncome) >= 0.6) verdict = "Don't Borrow";
  const isLifestyle = ['wedding', 'consumption', 'emergency'].includes(profile.loanPurpose);
  if (isLifestyle && targetAmount > safeCapacityAmount) verdict = 'Borrow Less';
  if (['business_expansion','asset_purchase'].includes(profile.loanPurpose) && ((existingEmis / recognizedIncome) <= 0.4)) verdict = 'Borrow';

  const base = 8.5;
  let spreadLow = 2.0, spreadHigh = 3.0;
  if (employmentType === 'self_employed' && profile.ownsUnencumberedProperty) { spreadLow = 1.0; spreadHigh = 2.25; }
  else if (employmentType === 'self_employed') { spreadLow = 5.0; spreadHigh = 7.5; }
  else if (employmentType === 'informal') { spreadLow = 10.0; spreadHigh = 16.0; }
  if (cibil === null) { spreadLow -= 1.75; spreadHigh += 1.75; }
  const nominalLow = clamp(base + spreadLow, 0, 100);
  const nominalHigh = clamp(base + spreadHigh, 0, 100);
  const processingFeePct = 1.5;
  const exampleTenure = tenureMonths || 60;
  const aprLow = aprFromEmiAndFees(emiFromPrincipal(targetAmount||safeCapacityAmount, nominalLow, exampleTenure), exampleTenure, targetAmount||safeCapacityAmount, processingFeePct);
  const aprHigh = aprFromEmiAndFees(emiFromPrincipal(targetAmount||safeCapacityAmount, nominalHigh, exampleTenure), exampleTenure, targetAmount||safeCapacityAmount, processingFeePct);

  const tenures = [36,48,60];
  const tenureTable = tenures.map((t)=>({ months: t, safeAmount: Math.round(principalFromEmi(safeEmiCeiling, 11.0, t)) }));

  const stressIncomeDrop = (netMonthlySurplus * 0.8) - existingEmis;
  const stressSafeEmiAfterIncomeShock = Math.max(0, stressIncomeDrop * 0.6);
  const defaultBaseRate = 11.0;
  const requestedHikePct = (typeof profile.forcedRateHikePct === 'number') ? profile.forcedRateHikePct : 2.0;
  const rateBefore = defaultBaseRate;
  const rateAfter = defaultBaseRate + requestedHikePct;
  const emiBefore = emiFromPrincipal(safeCapacityAmount, rateBefore, tenureMonths);
  const emiAfter = emiFromPrincipal(safeCapacityAmount, rateAfter, tenureMonths);
  const rateHikeEmiIncrease = Math.round(emiAfter - emiBefore);

  const negotiation = {
    fairRateText: `Fair rate for your profile is ${nominalLow.toFixed(2)}% - ${nominalHigh.toFixed(2)}%` + (cibil? ` because CIBIL ${cibil}` : ' (credit score unknown)') + `.`,
    counterScript: `If lender quotes higher than ${nominalHigh.toFixed(1)}% say: 'My FOIR is under ${(recognizedIncome>0? (existingEmis/recognizedIncome*100).toFixed(1) : 'N/A')}% and I have no defaults; please match top NBFC offers.'`,
    reroute: employmentType==='self_employed' && profile.ownsUnencumberedProperty ? 'Consider LAP route: lower rates and higher ticket sizes.' : 'Avoid unsecured high-cost borrowing; consider secured options if available.'
  };

  return {
    verdict,
    lenderSanctionAmount: Math.round(lenderSanctionAmount),
    safeCapacityAmount: Math.round(safeCapacityAmount),
    safeEmiCeiling: Math.round(safeEmiCeiling),
    fairRate: { nominalLow: nominalLow.toFixed(2), nominalHigh: nominalHigh.toFixed(2), aprLow: aprLow.toFixed(2), aprHigh: aprHigh.toFixed(2) },
    tenureTable,
    stress: { incomeShock: { safeEmiAfterIncomeShock: Math.round(stressSafeEmiAfterIncomeShock) }, rateHike: { increasedEmi: Math.round(rateHikeEmiIncrease), emiBefore: Math.round(emiBefore), emiAfter: Math.round(emiAfter), rateBefore, rateAfter } },
    negotiation
  };
}

module.exports = (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
    let body = req.body;
    // Vercel passes JSON body already parsed in some runtimes; if not, try to parse
    if (!body || Object.keys(body).length === 0) {
      try { body = JSON.parse(require('fs').readFileSync(0, 'utf8')); } catch (e) { /* ignore */ }
    }
    if (!body) return res.status(400).json({ error: 'Profile JSON required in request body' });
    const result = evaluateProfile(body);
    return res.status(200).json({ profile: body, result });
  } catch (err) {
    console.error('Evaluate error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
