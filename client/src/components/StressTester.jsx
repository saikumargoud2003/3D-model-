import React from 'react';

export default function StressTester({ profile, onEvaluate }) {
  if (!profile) return <div className="mt-4 text-sm text-gray-600">Load a profile to run stress tests.</div>;

  function runIncomeShock() {
    const p = { ...profile };
    if (p.netMonthlyIncome) p.netMonthlyIncome = Math.round(p.netMonthlyIncome * 0.8);
    onEvaluate(p);
  }

  function runRateHike() {
    const p = { ...profile, forcedRateHikePct: 2.0 };
    onEvaluate(p);
  }

  return (
    <div className="mt-4 space-y-2">
      <h4 className="font-medium">Stress Tester</h4>
      <div className="flex gap-2">
        <button onClick={runIncomeShock} className="px-2 py-1 bg-yellow-500 text-white rounded">Income −20%</button>
        <button onClick={runRateHike} className="px-2 py-1 bg-red-600 text-white rounded">Rate +2%</button>
      </div>
    </div>
  );
}
