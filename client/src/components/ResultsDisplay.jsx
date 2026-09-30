import React from 'react';

export default function ResultsDisplay({ profile, result }) {
  if (!result) return <div>No results yet. Pick a preset or fill the form and Evaluate.</div>;

  return (
    <div>
      <h2 className="text-lg font-semibold">Verdict: <span className="font-bold">{result.verdict}</span></h2>
      <div className="mt-2">
        <p><strong>Lender Sanction (est):</strong> ₹{result.lenderSanctionAmount?.toLocaleString()}</p>
        <p><strong>Safe Capacity:</strong> ₹{result.safeCapacityAmount?.toLocaleString()}</p>
        <p><strong>Safe EMI Ceiling:</strong> ₹{result.safeEmiCeiling?.toLocaleString()}</p>
        <p className="mt-2"><strong>Fair Rate (nominal):</strong> {result.fairRate?.nominalLow}% - {result.fairRate?.nominalHigh}%</p>
        <p><strong>APR est:</strong> {result.fairRate?.aprLow}% - {result.fairRate?.aprHigh}%</p>
      </div>
      <div className="mt-3">
        <h3 className="font-semibold">Tenure trade-offs</h3>
        <ul>
          {result.tenureTable.map(t => (
            <li key={t.months}>{t.months} months — Safe Amount: ₹{t.safeAmount.toLocaleString()}</li>
          ))}
        </ul>
      </div>
      <div className="mt-3">
        <h3 className="font-semibold">Stress</h3>
        <p>Income shock (−20%) safe EMI after shock: ₹{result.stress.incomeShock.safeEmiAfterIncomeShock}</p>
        <p>Rate hike (+200bps) EMI increase: ₹{result.stress.rateHike.increasedEmi}</p>
      </div>
      <div className="mt-3">
        <h3 className="font-semibold">Negotiation Card</h3>
        <p>{result.negotiation.fairRateText}</p>
        <p className="italic">{result.negotiation.counterScript}</p>
        <p><strong>Recommendation:</strong> {result.negotiation.reroute}</p>
      </div>
    </div>
  );
}
