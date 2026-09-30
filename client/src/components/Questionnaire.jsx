import React, { useState, useEffect } from 'react';

const empty = {
  name: '',
  employmentType: 'salaried',
  netMonthlyIncome: 50000,
  loanPurpose: 'bike_loan',
  targetAmount: 200000,
  existingMonthlyEmis: 0,
  monthlyLivingExpenses: 20000,
  age: 30,
  cibilScore: null,
  city: 'Bengaluru'
};

const purposeOptions = [
  { value: 'bike_loan', label: 'Bike Loan' },
  { value: 'car_loan', label: 'Car Loan' },
  { value: 'home_loan', label: 'Home Loan' },
  { value: 'personal_loan', label: 'Personal Loan' },
  { value: 'business_expansion', label: 'Business Expansion' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'emergency', label: 'Emergency' }
];

export default function Questionnaire({ initialProfile = null, onEvaluate }) {
  const [form, setForm] = useState(empty);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (initialProfile) {
      const merged = { ...empty, ...initialProfile };
      setForm(merged);
    } else {
      setForm(empty);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProfile]);

  function update(field, value) { setForm(f => ({ ...f, [field]: value })); }

  function next() { setStep(s => Math.min(2, s + 1)); }
  function back() { setStep(s => Math.max(1, s - 1)); }

  function submit() {
    const finalName = (form.name || '').trim();
    if (!finalName) {
      const typedName = window.prompt('Please enter your name to continue');
      if (!typedName || !typedName.trim()) return alert('Name is required');
      const nextForm = { ...form, name: typedName.trim() };
      setForm(nextForm);
      onEvaluate(nextForm);
      return;
    }
    onEvaluate({ ...form, name: finalName });
  }

  return (
    <div>
      <div className="mb-2 text-xs text-slate-500">Step {step} of 2: {step === 1 ? 'Basics' : 'Profile Nuances'}</div>
      <div className="w-full bg-slate-200 h-2 rounded-full mb-3 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full transition-all" style={{ width: step === 1 ? '50%' : '100%' }} />
      </div>

      {step === 1 && (
        <div className="space-y-3 text-sm">
          <label className="block">
            <span className="mb-1 block text-slate-700 font-medium">Borrower Name</span>
            <input type="text" value={form.name} onChange={e => update('name', e.target.value)} className="block w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200" placeholder="e.g. Priya, Ravi, Anita" />
          </label>

          <label className="block">
            <span className="mb-1 block text-slate-700 font-medium">City</span>
            <input type="text" value={form.city || ''} onChange={e => update('city', e.target.value)} className="block w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200" placeholder="Bengaluru" />
          </label>

          <label className="block">
            <span className="mb-1 block text-slate-700 font-medium">Employment Type</span>
            <select value={form.employmentType} onChange={e => update('employmentType', e.target.value)} className="block w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200">
              <option value="salaried">Salaried</option>
              <option value="self_employed">Self-employed</option>
              <option value="informal">Informal / gig</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-slate-700 font-medium">Net Monthly Income</span>
            <input type="number" value={form.netMonthlyIncome} onChange={e => update('netMonthlyIncome', +e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200" />
          </label>

          <label className="block">
            <span className="mb-1 block text-slate-700 font-medium">Loan Purpose</span>
            <select value={form.loanPurpose} onChange={e => update('loanPurpose', e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200">
              {purposeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-slate-700 font-medium">Loan Amount Needed</span>
            <input type="number" value={form.targetAmount} onChange={e => update('targetAmount', +e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200" />
          </label>

          <label className="block">
            <span className="mb-1 block text-slate-700 font-medium">Existing Monthly EMIs</span>
            <input type="number" value={form.existingMonthlyEmis} onChange={e => update('existingMonthlyEmis', +e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200" />
          </label>

          <label className="block">
            <span className="mb-1 block text-slate-700 font-medium">Monthly Living Expenses</span>
            <input type="number" value={form.monthlyLivingExpenses} onChange={e => update('monthlyLivingExpenses', +e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200" />
          </label>

          <div className="flex gap-2 pt-1">
            <button onClick={next} className="flex-1 bg-gradient-to-r from-sky-600 to-indigo-600 text-white px-3 py-2.5 rounded-xl font-semibold">Next: Profile nuances</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3 text-sm">
          {form.employmentType === 'salaried' && (
            <>
              <label className="block">
                <span className="mb-1 block text-slate-700 font-medium">Employer Tier</span>
                <select value={form.employerTier || 'tier_1_mnc'} onChange={e => update('employerTier', e.target.value)} className="block w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200">
                  <option value="tier_1_mnc">Tier-1 MNC</option>
                  <option value="tier_2">Tier-2</option>
                  <option value="unlisted">Unlisted</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-slate-700 font-medium">Job Tenure (years)</span>
                <input type="number" value={form.jobTenureYears || 0} onChange={e => update('jobTenureYears', +e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200" />
              </label>
            </>
          )}

          {form.employmentType === 'self_employed' && (
            <>
              <label className="block">
                <span className="mb-1 block text-slate-700 font-medium">Annual ITR Income</span>
                <input type="number" value={form.annualItrIncome || 0} onChange={e => update('annualItrIncome', +e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200" />
              </label>
              <label className="block">
                <span className="mb-1 block text-slate-700 font-medium">Spouse Monthly Income</span>
                <input type="number" value={form.spouseMonthlyIncome || 0} onChange={e => update('spouseMonthlyIncome', +e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200" />
              </label>
              <label className="block">
                <span className="mb-1 block text-slate-700 font-medium">Owns Unencumbered Property?</span>
                <select value={form.ownsUnencumberedProperty ? 'yes' : 'no'} onChange={e => update('ownsUnencumberedProperty', e.target.value === 'yes')} className="block w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200">
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
              {form.ownsUnencumberedProperty && (
                <label className="block">
                  <span className="mb-1 block text-slate-700 font-medium">Property Estimated Value</span>
                  <input type="number" value={form.propertyEstimatedValue || 0} onChange={e => update('propertyEstimatedValue', +e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200" />
                </label>
              )}
            </>
          )}

          {form.employmentType === 'informal' && (
            <>
              <label className="block">
                <span className="mb-1 block text-slate-700 font-medium">High-interest App Loans</span>
                <input type="number" value={form.highInterestAppLoansCount || 0} onChange={e => update('highInterestAppLoansCount', +e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200" />
              </label>
              <label className="block">
                <span className="mb-1 block text-slate-700 font-medium">App Loans Total Balance</span>
                <input type="number" value={form.appLoansTotalBalance || 0} onChange={e => update('appLoansTotalBalance', +e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200" />
              </label>
              <label className="block">
                <span className="mb-1 block text-slate-700 font-medium">Bounced EMI in last 12 months?</span>
                <select value={form.bouncedEmiLast12m ? 'yes' : 'no'} onChange={e => update('bouncedEmiLast12m', e.target.value === 'yes')} className="block w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200">
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </label>
            </>
          )}

          <label className="block">
            <span className="mb-1 block text-slate-700 font-medium">CIBIL Score</span>
            <input type="number" value={form.cibilScore ?? ''} onChange={e => update('cibilScore', e.target.value === '' ? null : +e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200" placeholder="Optional / skip if unknown" />
          </label>

          <div className="flex gap-2 pt-1">
            <button onClick={back} className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl">Back</button>
            <button onClick={submit} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-2.5 rounded-xl font-semibold">Save & Evaluate</button>
          </div>
        </div>
      )}
    </div>
  );
}
