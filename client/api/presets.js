// client/api/presets.js
// Vercel serverless endpoint returning the preset borrower profiles

const presets = [
  {
    id: 'priya',
    label: 'Priya (MNC Salaried)',
    name: 'Priya',
    age: 29,
    city: 'Bengaluru',
    employmentType: 'salaried',
    employerTier: 'tier_1_mnc',
    jobTenureYears: 5,
    netMonthlyIncome: 110000,
    existingMonthlyEmis: 14000,
    cibilScore: 780,
    rent: 28000,
    monthlyLivingExpenses: 25000,
    targetAmount: 1800000,
    loanPurpose: 'wedding'
  },
  {
    id: 'ravi',
    label: 'Ravi (Kirana Owner)',
    name: 'Ravi',
    age: 42,
    city: 'Mysuru',
    employmentType: 'self_employed',
    annualItrIncome: 420000,
    netMonthlyIncome: 60000,
    spouseMonthlyIncome: 18000,
    existingMonthlyEmis: 0,
    cibilScore: null,
    livingExpenses: 30000,
    ownsUnencumberedProperty: true,
    propertyEstimatedValue: 4500000,
    targetAmount: 1500000,
    loanPurpose: 'business_expansion'
  },
  {
    id: 'anita',
    label: 'Anita (Gig Worker)',
    name: 'Anita',
    age: 35,
    city: 'Hubballi',
    employmentType: 'informal',
    netMonthlyIncome: 28000,
    spouseMonthlyIncome: 0,
    existingMonthlyEmis: 0,
    appLoansTotalBalance: 35000,
    highInterestAppLoansCount: 3,
    bouncedEmiLast12m: true,
    monthlyLivingExpenses: 22000,
    targetAmount: 150000,
    loanPurpose: 'bike_loan'
  }
];

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({ presets }));
};
