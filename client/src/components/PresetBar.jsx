import React from 'react';

export default function PresetBar({ presets = [], onPick }) {
  return (
    <div className="flex gap-2 items-center overflow-x-auto pb-2">
      {presets.map(p => (
        <button key={p.id} onClick={() => onPick(p)} className="whitespace-nowrap bg-gradient-to-r from-sky-600 to-indigo-600 text-white px-3 py-2 rounded-full text-sm shadow">{p.name}</button>
      ))}
      <button onClick={() => onPick(null)} className="whitespace-nowrap bg-white border border-gray-200 text-gray-800 px-3 py-2 rounded-full text-sm">Custom</button>
    </div>
  );
}
