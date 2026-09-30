import React, { useEffect, useState } from 'react';
import { ShieldCheck, Sparkles, WalletCards, BadgePercent } from 'lucide-react';
import PresetBar from './components/PresetBar';
import Questionnaire from './components/Questionnaire';
import ResultsView from './components/ResultsView';
import { fetchPresets, evaluateProfile } from './services/api';

export default function App() {
  const [presets, setPresets] = useState([]);
  const [profile, setProfile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    fetchPresets().then(r=>setPresets(r.presets || []));
  },[]);

  async function handleEvaluate(p) {
    if (!p) return;
    setProfile(p);
    setLoading(true);
    try {
      const res = await evaluateProfile(p);
      setResult(res.result);
    } catch (err) {
      console.error('Evaluation error', err);
    } finally { setLoading(false); }
  }

  function handlePickPreset(p) {
    if (!p) {
      setProfile(null); setResult(null); return;
    }
    handleEvaluate(p);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc,_#edf2ff_30%,_#e2e8f0_100%)] flex items-start justify-center py-6 px-3">
      <div className="max-w-md w-full bg-slate-50 rounded-[28px] shadow-[0_25px_60px_rgba(15,23,42,0.18)] border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-900 px-4 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-white/10 border border-white/10">
                <ShieldCheck size={16} className="text-emerald-300" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-300">Safe finance</div>
                <div className="text-lg font-bold">Borrower Copilot</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-200">
              <span className="inline-flex items-center gap-1 bg-white/5 rounded-full px-2 py-1"><Sparkles size={12} /> Smart</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="bg-white/5 rounded-2xl p-2 border border-white/10">
              <div className="flex items-center gap-1 text-[10px] text-slate-300"><WalletCards size={12} /> Sanction</div>
              <div className="mt-1 text-sm font-semibold">Bank view</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-2 border border-white/10">
              <div className="flex items-center gap-1 text-[10px] text-slate-300"><BadgePercent size={12} /> APR</div>
              <div className="mt-1 text-sm font-semibold">RBI style</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-2 border border-white/10">
              <div className="flex items-center gap-1 text-[10px] text-slate-300"><ShieldCheck size={12} /> Safety</div>
              <div className="mt-1 text-sm font-semibold">Guardrails</div>
            </div>
          </div>
        </div>

        <div className="px-4 pt-4 pb-2">
          <PresetBar presets={presets} onPick={handlePickPreset} />
        </div>

        <div className="px-4 pb-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3">
            <Questionnaire initialProfile={profile} onEvaluate={handleEvaluate} />
          </div>

          <div className="mt-4">
            <ResultsView profile={profile} result={result} loading={loading} onReEvaluate={handleEvaluate} />
          </div>
        </div>
      </div>
    </div>
  )
}
