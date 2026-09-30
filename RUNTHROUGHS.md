# RUNTHROUGHS.md

This document records the preset question flows for Priya, Ravi, and Anita and the expected outputs (verdict, sanction vs safe capacity, fair rate band, APR band, negotiation card text).

## 1) Priya (29, Bengaluru)

Profile (Tier-1 salaried)
- employmentType: salaried
- employerTier: tier_1_mnc
- jobTenureYears: 5
- netMonthlyIncome: ₹110,000
- existingMonthlyEmis: ₹14,000
- cibilScore: 780
- rent: ₹28,000
- monthlyLivingExpenses: ₹25,000
- targetAmount: ₹1,800,000
- loanPurpose: wedding

Expected evaluation summary
- Verdict: Borrow Less
  - Reason: Wedding (lifestyle) request larger than conservative safe capacity; FOIR suggests lender sanction possible but safe borrower capacity is lower.
- Lender Sanction (est): ~₹16L–18L
  - Calculation: FOIR 50% allowed EMI on net income minus existing EMI, PV at 11.5% over 60 months.
- Safe Capacity: ~₹10L–12L
  - Calculation: Net surplus (income + spouse*0.7 - living costs - existing EMIs) → 60% used for safe EMI → PV across tenure.
- Fair Rate: 10.5%–11.5% (nominal)
  - APR (All-in): ~11.8% (includes processing fee + 18% GST in APR solver)

Negotiation Card (one-liner)
- "Fair rate for your profile is 10.5% - 11.5% because: Tier-1 MNC, 780 CIBIL, low current FOIR."
- Counter-script: "Lender quotes 14%? Counter: 'My FOIR is under 35% with zero defaults; top NBFCs offer 11% for prime salaried profiles.'"
- Reroute: If lender insists on high unsecured pricing, consider smaller amount or employer-linked loans or top-up from sanctionable secured products.

---

## 2) Ravi (42, Mysuru)

Profile (self-employed, owns unencumbered property)
- employmentType: self_employed
- netMonthlyIncome (cash): ₹60,000
- annualItrIncome: ₹4,20,000 (₹35,000/month recognised)
- spouseMonthlyIncome: ₹18,000
- livingExpenses: ₹30,000
- ownsUnencumberedProperty: true (shop worth ₹45,00,000)
- targetAmount: ₹15,00,000
- loanPurpose: business_expansion
- cibilScore: null (unknown)

Expected evaluation summary
- Verdict: Borrow (Secured Route)
  - Reason: Productive/business purpose and property collateral enables LAP which increases sanction size.
- Lender Sanction (Unsecured est): ~₹4.8L–5.2L
  - Based on unsecured FOIR on ITR-recognised income and higher unsecured rate assumption.
- Lender Sanction (LAP): Up to ₹22.5L (50% of property value)
- Safe Capacity: depends on chosen route; secured route provides higher sanction though borrower should account for business volatility.
- Fair Rate: 9.5%–10.75% (LAP band nominal)

Negotiation Card
- "Fair rate for your profile is 9.5% - 10.75% because: LAP route with collateral reduces risk premium (no bureau available)."
- Counter-script: "If quoted >11% say: 'I prefer LAP pricing given collateral — please provide LTV details and match range.'"
- Reroute: Recommend LAP over unsecured for both lower rate and higher ticket sizes.

---

## 3) Anita (35, Hubballi)

Profile (informal, gig + tailoring)
- employmentType: informal
- netMonthlyIncome: ₹28,000
- spouseMonthlyIncome: 0
- monthlyLivingExpenses: ₹22,000
- appLoansTotalBalance: ₹35,000 across 3 app loans at very high APRs
- highInterestAppLoansCount: 3
- bouncedEmiLast12m: true
- targetAmount: ₹150,000
- loanPurpose: bike_loan (bike purchase)

Expected evaluation summary
- Verdict: Don't Borrow
  - Reason: Recent bounced EMI combined with multiple high-interest app loans indicates high rollover/default risk. Adding new debt likely to worsen situation.
- Lender Sanction: likely rejection or only predatory high-cost offers; micro-lender caps apply or refusal if no bureau and defaults exist.
- Safe Capacity: ₹0 (no safe new debt recommended)
- Fair Rate: Informal band is high (nominal 18.5%–24.5%) but recommendation is to avoid unsecured borrowing at these rates.

Negotiation Card
- "Fair rate for your profile is 18.5% - 24.5% (informal band). Given bounced EMI and multiple app loans, recommendation: clear high-cost debt first or explore leasing/lease-to-own schemes for bikes."
- Counter-script: "If offered unsecured loan at 16% (predatory), respond: 'I can't afford rollover; please provide alternative rehab options or suggest a secured/lease product.'"

---

Notes on question flow
- Tier 1 questions captured in the UI: employmentType, netMonthlyIncome, loanPurpose, targetAmount, existingMonthlyEmis, monthlyLivingExpenses, age, cibilScore.
- Adaptive Tier 2 questions show based on employmentType selection (employerTier, jobTenureYears; annualItrIncome, ownsUnencumberedProperty, propertyEstimatedValue; app loan counts/balances, bounced flags).
- The presets map directly to the profiles above and are available via GET /api/presets for UI one-click evaluation.

These runthroughs should match the outputs from the evaluation engine in server/src/engine/rulesEngine.js for the preset inputs.