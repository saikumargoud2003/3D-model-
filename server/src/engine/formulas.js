// server/src/engine/formulas.js
// EMI and PV formulas
function emiFromPrincipal(P, annualRatePct, tenureMonths) {
  if (tenureMonths <= 0) return 0;
  const r = annualRatePct / 12 / 100;
  if (r === 0) return P / tenureMonths;
  const top = P * r * Math.pow(1 + r, tenureMonths);
  const bot = Math.pow(1 + r, tenureMonths) - 1;
  return top / bot;
}

function principalFromEmi(EMI, annualRatePct, tenureMonths) {
  const r = annualRatePct / 12 / 100;
  if (r === 0) return EMI * tenureMonths;
  const pv = EMI * (Math.pow(1 + r, tenureMonths) - 1) / (r * Math.pow(1 + r, tenureMonths));
  return pv;
}

// Approximate APR including upfront processing fee + GST using simple numeric solver to find annual rate that matches net disbursed amount
function aprFromEmiAndFees(EMI, tenureMonths, principal, processingFeePct) {
  // Net disbursed = principal - fee*(1+gst)
  const fee = principal * (processingFeePct / 100) * 1.18; // include 18% GST
  const net = principal - fee;
  // Find annual rate such that PV of EMI stream discounted monthly equals net.
  // Solve for monthly rate m where net = sum(EMI / (1+m)^t, t=1..n)
  // We'll use binary search on annual rate between 0% and 100%
  let low = 0, high = 1.0, mid;
  for (let iter = 0; iter < 60; iter++) {
    mid = (low + high) / 2;
    const r = mid / 12;
    let pv = 0;
    for (let t = 1; t <= tenureMonths; t++) pv += EMI / Math.pow(1 + r, t);
    if (pv > net) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return mid * 100; // annual percent
}

module.exports = { emiFromPrincipal, principalFromEmi, aprFromEmiAndFees };
