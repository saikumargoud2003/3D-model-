# RULES.md

This file documents parameters, thresholds, why they exist, and whether the source is RBI regulation, common bank underwriting benchmarks, or project judgement.

| Parameter | Threshold / Value | Why it exists | Source |
|---|---:|---|---|
| FOIR cap (salaried) | 50% | Typical bank FOIR assumption for salaried applicants (what banks allow for EMI portion). Used to estimate sanctionable EMI. | Bank underwriting benchmark (industry) |
| FOIR cap (self-employed unsecured) | 40% | Banks typically recognise lower unsecured capacity from unverified business incomes. | Bank underwriting benchmark / judgement |
| LAP LTV (Loan Against Property) | 50% of property value | Conservative LTV for small-ticket LAP estimation; reduces underwriting complexity for demo. | Conservative judgement (industry ranges 50-75%) |
| Micro / Informal cap | ₹100,000 | Microfinance / informal credit small ticket cap used to restrict bank sanction for informal applicants. | Project judgement (reflects micro-lending limits) |
| Safe EMI buffer | 40% reserved | Borrower-level safety: keep 40% of surplus for shocks so safe EMI uses 60% of surplus. | Product judgement (borrower protection) |
| Emergency buffer (minimum residual) | 15% of income | A guardrail: don't recommend loans that drop residual cash below 15%. | Product judgement / behavioural finance |
| "Don't Borrow" triggers | bounced EMI in last 12m + app-loan count > 0 OR existing EMI/recognized income >= 60% | High risk of rollover / inability to service — recommend not to borrow. | Underwriting prudence (judgement) |
| Benchmark base rate | 8.50% | RBI-referenced base for fair rate bands in outputs. | RBI / market reference (repo-linked benchmark) |
| Spreads (salaried prime) | +2.0% to +3.0% | Reflects spread above benchmark for top salaried borrowers with >780 CIBIL. | Bank pricing bands / judgement |
| Spreads (self-employed LAP) | +1.0% to +2.25% | Lower spread for secured LAP route. | Bank pricing bands / judgement |
| Spreads (self-employed unsecured) | +5.0% to +7.5% | Higher risk premium for unsecured self-employed customers. | Bank pricing bands / judgement |
| Spreads (informal / micro) | +10.0% to +16.0% | Very high risk premium for informal cash-in-hand profiles without bureau. | Market observation / judgement |
| Unknown credit score widening | ±1.75% to band | Widen nominal spread due to uncertainty when CIBIL is not provided. | Product judgement |
| Processing fee for APR calc | 1.5% (default used) | Conservative processing fee to compute All-in APR including GST. | Product default (adjustable) |
| GST on fees | 18% | Applied to processing fee when calculating All-in APR per RBI guidance on fee taxation. | Statutory (GST) |
| Tenures shown | 36, 48, 60 months | Common retail tenures for personal and consumer loans; used to show trade-offs. | Market practice |

Notes:
- All thresholds are intentionally conservative — this product is an advisory tool and errs on borrower protection side.
- The rules combine regulatory reference points (RBI base rate, GST) with bank underwriting heuristics and product-level judgements (buffers, spreads). For production these should be adjusted to institution policy and regulatory compliance review.
