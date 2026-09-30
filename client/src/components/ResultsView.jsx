import React from 'react';
import { Copy, Printer, TrendingUp, ShieldAlert } from 'lucide-react';

function VerdictBadge({ verdict }) {
  if (!verdict) return null;
  const map = {
    'Borrow': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Borrow Less': 'bg-amber-100 text-amber-800 border-amber-200',
    "Don't Borrow": 'bg-rose-100 text-rose-800 border-rose-200'
  };
  const cls = map[verdict] || 'bg-gray-100 text-gray-800';
  return <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full border ${cls} text-sm font-semibold`}>{verdict}</span>;
}

function Money({ value }) {
  return <span className="font-mono">₹{(value || 0).toLocaleString('en-IN')}</span>;
}

export default function ResultsView({ profile, result, loading, onReEvaluate }) {
  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-sm font-medium text-slate-600">Calculating your risk profile...</div><div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full w-2/3 bg-gradient-to-r from-sky-500 to-indigo-600 animate-pulse"/></div></div>;
  if (!result) return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">No results yet. Choose a preset or fill the form and press Save & Evaluate.</div>;

  const { verdict, lenderSanctionAmount, safeCapacityAmount, safeEmiCeiling, fairRate, tenureTable, stress, negotiation } = result;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-sky-50 p-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Assessment</div>
            <div className="text-lg font-bold text-slate-800">Verdict</div>
          </div>
          <VerdictBadge verdict={verdict} />
        </div>
        <div className="mt-3 text-sm text-slate-700">{negotiation?.fairRateText || ''}</div>
        <div className="mt-2 text-xs text-slate-600 border-t pt-2">{negotiation?.counterScript}</div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Lender sanction</div>
              <div className="text-lg font-bold text-slate-800"><Money value={lenderSanctionAmount} /></div>
            </div>
            <div className="rounded-full bg-sky-100 text-sky-700 px-2 py-1 text-[10px] font-semibold">Bank view</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Safe capacity</div>
              <div className="text-lg font-bold text-slate-800"><Money value={safeCapacityAmount} /></div>
            </div>
            <div className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-1 text-[10px] font-semibold">Budget reality</div>
          </div>
          <div className="mt-3 text-xs text-slate-500">Safe EMI ceiling: <span className="font-semibold text-slate-800">₹{(safeEmiCeiling || 0).toLocaleString('en-IN')}</span></div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Fair rate</div>
            <div className="text-lg font-bold text-slate-800">{fairRate?.nominalLow}% - {fairRate?.nominalHigh}%</div>
            <div className="text-xs text-slate-500">All-in APR: {fairRate?.aprLow}% - {fairRate?.aprHigh}%</div>
          </div>
          <div className="rounded-full bg-indigo-100 text-indigo-700 px-2 py-1 text-[10px] font-semibold">Medium confidence</div>
        </div>

        <div className="mt-3">
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-[0.16em] mb-2">Tenure trade-off</div>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            {tenureTable.map(t => (
              <div key={t.months} className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-center">
                <div className="font-bold text-slate-800">{t.months}m</div>
                <div className="mt-1 text-slate-600">Safe <span className="font-semibold">₹{t.safeAmount.toLocaleString('en-IN')}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><TrendingUp size={15} className="text-violet-600" /> Stress scenarios</div>
        <div className="mt-3 text-xs text-slate-600 space-y-2">
          <div>Income shock (−20%): Safe EMI after shock <strong>₹{(stress?.incomeShock?.safeEmiAfterIncomeShock || 0).toLocaleString('en-IN')}</strong></div>
          { (stress?.rateHike?.emiBefore === 0 && stress?.rateHike?.emiAfter === 0) ? (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-2 text-rose-700">
              <ShieldAlert size={16} className="mt-0.5" />
              <div>Rate stress not applicable — safe capacity is ₹0. Clear high-cost debts before taking new credit.</div>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-2">
              <div>Rate hike: {stress?.rateHike?.rateBefore}% → {stress?.rateHike?.rateAfter}%</div>
              <div className="mt-1">EMI before: <strong>₹{(stress?.rateHike?.emiBefore || 0).toLocaleString('en-IN')}</strong></div>
              <div>EMI after: <strong>₹{(stress?.rateHike?.emiAfter || 0).toLocaleString('en-IN')}</strong></div>
              <div>EMI increase: <strong>₹{(stress?.rateHike?.increasedEmi || 0).toLocaleString('en-IN')}</strong></div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-300">Negotiation card</div>
            <div className="text-sm font-semibold">{profile?.name || 'Borrower'}</div>
          </div>
          <VerdictBadge verdict={verdict} />
        </div>
        <div className="mt-3 text-xs text-slate-300">{negotiation?.fairRateText}</div>
        <div className="mt-2 text-xs text-slate-200 border-t border-slate-700 pt-2">{negotiation?.counterScript}</div>
        <div className="mt-3 flex gap-2">
          <button onClick={()=>navigator.clipboard?.writeText(negotiation?.counterScript || '')} className="flex-1 rounded-xl bg-sky-500 text-white py-2 text-xs font-semibold flex items-center justify-center gap-2"><Copy size={14}/> Copy script</button>
          <button onClick={()=>window.print()} className="flex-1 rounded-xl bg-white text-slate-900 py-2 text-xs font-semibold flex items-center justify-center gap-2"><Printer size={14}/> Print</button>
        </div>
      </div>
    </div>
  );
}
