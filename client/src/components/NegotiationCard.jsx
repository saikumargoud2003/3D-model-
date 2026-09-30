import React from 'react';

export default function NegotiationCard({ negotiation }) {
  if (!negotiation) return null;
  return (
    <div className="border rounded p-3 bg-gray-50">
      <p className="font-semibold">{negotiation.fairRateText}</p>
      <p className="mt-2 italic">{negotiation.counterScript}</p>
      <p className="mt-2"><strong>Tip:</strong> {negotiation.reroute}</p>
    </div>
  );
}
