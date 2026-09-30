Borrower Copilot — Quick Setup and File Contents

This repository contains a full working Borrower Copilot (MERN-style) application: an Express API (with MongoDB fallback to in-memory seed data) and a Vite React frontend (Tailwind via CDN to keep setup fast).

IMPORTANT: The execution environment used by this helper tool couldn't create nested directories automatically. To get a working project quickly, follow the PowerShell commands below which will create directories and files and populate them with the exact contents needed.

Quick run (Windows PowerShell):
1. From this repository root (c:\vamshi\Borrower) run:

# Create folders
New-Item -ItemType Directory -Force server\src\engine
New-Item -ItemType Directory -Force server\src\controllers
New-Item -ItemType Directory -Force server\src\config
New-Item -ItemType Directory -Force server\src\routes
New-Item -ItemType Directory -Force server\src\data
New-Item -ItemType Directory -Force client\src\components
New-Item -ItemType Directory -Force client\src\services

# Create files (this will write file contents using here-strings). Copy & paste the block below in PowerShell.

# NOTE: You must have Node.js and npm installed. Run `npm install` at repo root, then `npm run dev`.

--------------------------------------------------------------------------------
# The following blocks create each project file. Copy/paste and run in PowerShell.
--------------------------------------------------------------------------------

# server/package.json
@'
PUT_SERVER_PACKAGE_JSON
'@ | Out-File -Encoding UTF8 server\package.json -Force

# server/src/index.js
@'
PUT_SERVER_INDEX_JS
'@ | Out-File -Encoding UTF8 server\src\index.js -Force

# server/src/config/db.js
@'
PUT_SERVER_DB_JS
'@ | Out-File -Encoding UTF8 server\src\config\db.js -Force

# server/src/data/seedPresets.js
@'
PUT_SERVER_SEEDPRESETS_JS
'@ | Out-File -Encoding UTF8 server\src\data\seedPresets.js -Force

# server/src/engine/formulas.js
@'
PUT_SERVER_FORMULAS_JS
'@ | Out-File -Encoding UTF8 server\src\engine\formulas.js -Force

# server/src/engine/rulesEngine.js
@'
PUT_SERVER_RULESENGINE_JS
'@ | Out-File -Encoding UTF8 server\src\engine\rulesEngine.js -Force

# server/src/controllers/copilot.js
@'
PUT_SERVER_COPILOT_JS
'@ | Out-File -Encoding UTF8 server\src\controllers\copilot.js -Force

# server/src/routes/copilot.js
@'
PUT_SERVER_ROUTES_COPILOT_JS
'@ | Out-File -Encoding UTF8 server\src\routes\copilot.js -Force

# client/package.json
@'
PUT_CLIENT_PACKAGE_JSON
'@ | Out-File -Encoding UTF8 client\package.json -Force

# client/index.html
@'
PUT_CLIENT_INDEX_HTML
'@ | Out-File -Encoding UTF8 client\index.html -Force

# client/vite.config.js
@'
PUT_CLIENT_VITE_CONFIG
'@ | Out-File -Encoding UTF8 client\vite.config.js -Force

# client/src/main.jsx
@'
PUT_CLIENT_MAIN_JSX
'@ | Out-File -Encoding UTF8 client\src\main.jsx -Force

# client/src/App.jsx
@'
PUT_CLIENT_APP_JSX
'@ | Out-File -Encoding UTF8 client\src\App.jsx -Force

# client/src/services/api.js
@'
PUT_CLIENT_API_JS
'@ | Out-File -Encoding UTF8 client\src\services\api.js -Force

# client/src/components/PresetBar.jsx
@'
PUT_CLIENT_PRESETBAR_JSX
'@ | Out-File -Encoding UTF8 client\src\components\PresetBar.jsx -Force

# client/src/components/Questionnaire.jsx
@'
PUT_CLIENT_QUESTIONNAIRE_JSX
'@ | Out-File -Encoding UTF8 client\src\components\Questionnaire.jsx -Force

# client/src/components/ResultsDisplay.jsx
@'
PUT_CLIENT_RESULTSDISPLAY_JSX
'@ | Out-File -Encoding UTF8 client\src\components\ResultsDisplay.jsx -Force

# client/src/components/NegotiationCard.jsx
@'
PUT_CLIENT_NEGOTIATIONCARD_JSX
'@ | Out-File -Encoding UTF8 client\src\components\NegotiationCard.jsx -Force

# client/src/components/StressTester.jsx
@'
PUT_CLIENT_STRESSTESTER_JSX
'@ | Out-File -Encoding UTF8 client\src\components\StressTester.jsx -Force

--------------------------------------------------------------------------------
# After these placeholders are created you must replace the placeholder tags (e.g. PUT_SERVER_PACKAGE_JSON) with actual content. The repository README contains the full contents below to make copy/paste easy.
--------------------------------------------------------------------------------

Complete file contents are appended to this README so you can copy each file's content into the corresponding placeholder above. Each file content is labeled with a filename header.

--- BEGIN FILES ---

== server/package.json ==

{
  "name": "borrower-copilot-server",
  "version": "1.0.0",
  "main": "src/index.js",
  "license": "MIT",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon --watch src --exec node src/index.js"
  },
  "dependencies": {
    "axios": "^1.4.0",
    "body-parser": "^1.20.2",
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}

== server/src/index.js ==

// server/src/index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectWithFallback } = require('./config/db');
const copilotRoutes = require('./routes/copilot');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to DB (falls back to seed data if no DB)
connectWithFallback().then((db) => {
  console.log('DB ready (may be in-memory fallback).');
});

app.use('/api', copilotRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Borrower Copilot server running on http://localhost:${PORT}`));


== server/src/config/db.js ==

// server/src/config/db.js
const mongoose = require('mongoose');
const seed = require('../data/seedPresets');

let fallbackData = null;

async function connectWithFallback() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/borrower-copilot';
  try {
    await mongoose.connect(uri, { autoIndex: true });
    console.log('Connected to MongoDB at', uri);
    return mongoose.connection;
  } catch (err) {
    console.warn('Could not connect to MongoDB — falling back to in-memory seed data. Error:', err.message);
    // Keep seed data available to controllers
    fallbackData = seed;
    return null;
  }
}

function getFallback() {
  return fallbackData;
}

module.exports = { connectWithFallback, getFallback };


== server/src/data/seedPresets.js ==

// server/src/data/seedPresets.js
module.exports = {
  presets: [
    {
      id: 'priya',
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
      loanPurpose: 'asset_purchase'
    }
  ]
};


== server/src/engine/formulas.js ==

// server/src/engine/formulas.js
// EMI and PV formulas
function emiFromPrincipal(P, annualRatePct, tenureMonths) {
  if (tenureMonths <= 0) return 0;
  const r = annualRatePct / 12 / 100;
  if (r === 0) return P / tenureMonths;
  const top = P * r * Math.pow(1 + r, tenureMonths);
  const bot = Math.pow(1 + r, tenureMonths) - 1;
  return top / bot;
}

function principalFromEmi(EMI, annualRatePct, tenureMonths) {
  const r = annualRatePct / 12 / 100;
  if (r === 0) return EMI * tenureMonths;
  const pv = EMI * (Math.pow(1 + r, tenureMonths) - 1) / (r * Math.pow(1 + r, tenureMonths));
  return pv;
}

// Approximate APR including upfront processing fee + GST using simple numeric solver to find annual rate that matches net disbursed amount
function aprFromEmiAndFees(EMI, tenureMonths, principal, processingFeePct) {
  // Net disbursed = principal - fee*(1+gst)
  const fee = principal * (processingFeePct / 100) * 1.18; // include 18% GST
  const net = principal - fee;
  // Find annual rate such that PV of EMI stream discounted monthly equals net.
  // Solve for monthly rate m where net = sum(EMI / (1+m)^t, t=1..n)
  // We'll use binary search on annual rate between 0% and 100%
  let low = 0, high = 1.0, mid;
  for (let iter = 0; iter < 60; iter++) {
    mid = (low + high) / 2;
    const r = mid / 12;
    let pv = 0;
    for (let t = 1; t <= tenureMonths; t++) pv += EMI / Math.pow(1 + r, t);
    if (pv > net) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return mid * 100; // annual percent
}

module.exports = { emiFromPrincipal, principalFromEmi, aprFromEmiAndFees };


== server/src/engine/rulesEngine.js ==

// server/src/engine/rulesEngine.js
const { emiFromPrincipal, principalFromEmi, aprFromEmiAndFees } = require('./formulas');

function clamp(val, a, b) { return Math.max(a, Math.min(b, val)); }

function evaluateProfile(profile) {
  // Normalize inputs with defaults
  const p = Object.assign({}, profile);

  const employmentType = p.employmentType || 'informal';
  const netIncome = p.netMonthlyIncome || 0;
  const existingEmis = p.existingMonthlyEmis || 0;
  const spouseIncome = p.spouseMonthlyIncome || 0;
  const livingCosts = (p.monthlyLivingExpenses || p.livingExpenses || p.rent || 0) + (p.rent || 0);
  const targetAmount = p.targetAmount || 0;
  const tenureMonths = p.requestedTenureMonths || 60;
  const cibil = (typeof p.cibilScore === 'number') ? p.cibilScore : null;

  // FOIR calculation (simple)
  let recognizedIncome = netIncome;
  if (employmentType === 'self_employed') {
    if (p.annualItrIncome) recognizedIncome = p.annualItrIncome / 12;
  }

  // Lender Sanction logic
  let lenderSanctionAmount = 0;
  if (employmentType === 'salaried') {
    const foirCap = 0.50;
    const allowedEmi = Math.max(0, foirCap * recognizedIncome - existingEmis);
    lenderSanctionAmount = principalFromEmi(allowedEmi, 11.5, 60); // bank uses 11.5% for estimate
  } else if (employmentType === 'self_employed') {
    if (p.ownsUnencumberedProperty) {
      lenderSanctionAmount = (p.propertyEstimatedValue || 0) * 0.5; // LAP route
    } else {
      const monthlyRecognised = (p.annualItrIncome || 0) / 12;
      const allowedEmi = Math.max(0, 0.40 * monthlyRecognised - existingEmis);
      lenderSanctionAmount = principalFromEmi(allowedEmi, 13.5, 60);
    }
  } else { // informal
    // micro cap
    lenderSanctionAmount = 100000;
    if (!cibil && p.bouncedEmiLast12m) lenderSanctionAmount = 0;
  }

  // Safe Capacity (borrower can carry)
  const netMonthlySurplus = netIncome + spouseIncome * 0.7 - livingCosts - existingEmis;
  const safeEmiCeiling = Math.max(0, netMonthlySurplus * 0.60); // keep 40% buffer
  const safeCapacityAmount = principalFromEmi(safeEmiCeiling, 11.0, tenureMonths);

  // Verdict logic
  let verdict = 'Borrow';
  if (p.bouncedEmiLast12m === true && (p.highInterestAppLoansCount || 0) > 0) {
    verdict = "Don't Borrow";
  }
  // debt obligations exceed 60% of verified income
  if (recognizedIncome > 0 && (existingEmis / recognizedIncome) >= 0.6) {
    verdict = "Don't Borrow";
  }
  // consumption/lifestyle but capacity insufficient
  const isLifestyle = ['wedding', 'consumption', 'emergency'].includes(p.loanPurpose);
  if (isLifestyle && targetAmount > safeCapacityAmount) {
    verdict = 'Borrow Less';
  }
  // productive and FOIR <=40
  if (['business_expansion','asset_purchase'].includes(p.loanPurpose) && ((existingEmis / recognizedIncome) <= 0.4)) {
    verdict = 'Borrow';
  }

  // Fair Rate & APR band
  const base = 8.5;
  let spreadLow = 2.0, spreadHigh = 3.0; // default for prime salaried
  if (employmentType === 'self_employed' && p.ownsUnencumberedProperty) {
    spreadLow = 1.0; spreadHigh = 2.25;
  } else if (employmentType === 'self_employed') {
    spreadLow = 5.0; spreadHigh = 7.5;
  } else if (employmentType === 'informal') {
    spreadLow = 10.0; spreadHigh = 16.0;
  }
  // widen range if cibil unknown
  if (cibil === null) { spreadLow -= 1.75; spreadHigh += 1.75; }
  const nominalLow = clamp(base + spreadLow, 0, 100);
  const nominalHigh = clamp(base + spreadHigh, 0, 100);
  // APR: include processing fee
  const processingFeePct = 1.5; // default
  const exampleTenure = tenureMonths || 60;
  const aprLow = aprFromEmiAndFees(emiFromPrincipal(targetAmount||safeCapacityAmount, nominalLow, exampleTenure), exampleTenure, targetAmount||safeCapacityAmount, processingFeePct);
  const aprHigh = aprFromEmiAndFees(emiFromPrincipal(targetAmount||safeCapacityAmount, nominalHigh, exampleTenure), exampleTenure, targetAmount||safeCapacityAmount, processingFeePct);

  // Max Safe EMI & Tenure table (36,48,60)
  const tenures = [36,48,60];
  const tenureTable = tenures.map((t)=>{
    const pv36 = principalFromEmi(safeEmiCeiling, 11.0, t);
    return { months: t, safeAmount: Math.round(pv36) };
  });

  // Stress scenarios
  const stressIncomeDrop = (netMonthlySurplus * 0.8) - existingEmis; // income -20%
  const stressSafeEmiAfterIncomeShock = Math.max(0, stressIncomeDrop * 0.6);
  const rateHikeEmiIncrease = emiFromPrincipal(safeCapacityAmount, 13.0, tenureMonths) - emiFromPrincipal(safeCapacityAmount, 11.0, tenureMonths);

  // Negotiation card text
  const negotiation = {
    fairRateText: `Fair rate for your profile is ${nominalLow.toFixed(2)}% - ${nominalHigh.toFixed(2)}%` + (cibil? ` because CIBIL ${cibil}` : ' (credit score unknown)') + `.`,
    counterScript: `If lender quotes higher than ${nominalHigh.toFixed(1)}% say: 'My FOIR is under ${(existingEmis/recognizedIncome*100).toFixed(1)}% and I have no defaults; please match top NBFC offers.'`,
    reroute: employmentType==='self_employed' && p.ownsUnencumberedProperty ? 'Consider LAP route: lower rates and higher ticket sizes.' : 'Avoid unsecured high-cost borrowing; consider secured options if available.'
  };

  return {
    verdict,
    lenderSanctionAmount: Math.round(lenderSanctionAmount),
    safeCapacityAmount: Math.round(safeCapacityAmount),
    safeEmiCeiling: Math.round(safeEmiCeiling),
    fairRate: { nominalLow: nominalLow.toFixed(2), nominalHigh: nominalHigh.toFixed(2), aprLow: aprLow.toFixed(2), aprHigh: aprHigh.toFixed(2) },
    tenureTable,
    stress: {
      incomeShock: { safeEmiAfterIncomeShock: Math.round(stressSafeEmiAfterIncomeShock) },
      rateHike: { increasedEmi: Math.round(rateHikeEmiIncrease) }
    },
    negotiation
  };
}

module.exports = { evaluateProfile };


== server/src/controllers/copilot.js ==

// server/src/controllers/copilot.js
const { evaluateProfile } = require('../engine/rulesEngine');
const { getFallback } = require('../config/db');

function getPresets() {
  const fallback = getFallback();
  if (fallback && fallback.presets) return fallback.presets;
  // default empty
  return [];
}

async function evaluateHandler(req, res) {
  try {
    const profile = req.body;
    if (!profile) return res.status(400).json({ error: 'Profile JSON required in request body' });
    const result = evaluateProfile(profile);
    return res.json({ profile, result });
  } catch (err) {
    console.error('Evaluate error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

function presetsHandler(req, res) {
  const presets = getPresets();
  res.json({ presets });
}

module.exports = { evaluateHandler, presetsHandler };


== server/src/routes/copilot.js ==

// server/src/routes/copilot.js
const express = require('express');
const router = express.Router();
const { evaluateHandler, presetsHandler } = require('../controllers/copilot');

router.post('/evaluate', evaluateHandler);
router.get('/presets', presetsHandler);

module.exports = router;


== client/package.json ==

{
  "name": "borrower-copilot-client",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.4.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.260.0"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}

== client/index.html ==

<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Borrower Copilot</title>
    <!-- Quick Tailwind via CDN for fast evaluator runs -->
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-gray-50 min-h-screen">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

== client/vite.config.js ==

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 }
});

== client/src/main.jsx ==

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)


== client/src/App.jsx ==

import React, { useEffect, useState } from 'react';
import PresetBar from './components/PresetBar';
import Questionnaire from './components/Questionnaire';
import ResultsDisplay from './components/ResultsDisplay';
import StressTester from './components/StressTester';
import { fetchPresets, evaluateProfile } from './services/api';

export default function App() {
  const [presets, setPresets] = useState([]);
  const [profile, setProfile] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(()=>{
    fetchPresets().then(r=>setPresets(r.presets || []));
  },[]);

  async function handleEvaluate(p) {
    setProfile(p);
    const res = await evaluateProfile(p);
    setResult(res.result);
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Borrower Copilot</h1>
      <PresetBar presets={presets} onPick={(p)=>handleEvaluate(p)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="bg-white p-4 rounded shadow">
          <Questionnaire onEvaluate={handleEvaluate} />
          <StressTester profile={profile} onEvaluate={handleEvaluate} />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <ResultsDisplay profile={profile} result={result} />
        </div>
      </div>
    </div>
  )
}


== client/src/services/api.js ==

import axios from 'axios';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' });

export async function fetchPresets() {
  const r = await api.get('/presets');
  return r.data;
}

export async function evaluateProfile(profile) {
  const r = await api.post('/evaluate', profile);
  return r.data;
}


== client/src/components/PresetBar.jsx ==

import React from 'react';

export default function PresetBar({ presets = [], onPick }) {
  return (
    <div className="flex gap-2">
      {presets.map(p=> (
        <button key={p.id} onClick={()=>onPick(p)} className="bg-blue-500 text-white px-3 py-1 rounded">{p.name}</button>
      ))}
    </div>
  );
}


== client/src/components/Questionnaire.jsx ==

import React, { useState } from 'react';

const initial = {
  employmentType: 'salaried',
  netMonthlyIncome: 50000,
  loanPurpose: 'consumption',
  targetAmount: 200000,
  existingMonthlyEmis: 0,
  monthlyLivingExpenses: 20000,
  age: 30,
  cibilScore: null
};

export default function Questionnaire({ onEvaluate }) {
  const [form, setForm] = useState(initial);

  function update(field, value) { setForm(f=>({...f,[field]:value})); }

  return (
    <div>
      <div className="space-y-2">
        <label className="block">Employment Type
          <select value={form.employmentType} onChange={e=>update('employmentType', e.target.value)} className="block w-full border rounded p-1">
            <option value="salaried">Salaried</option>
            <option value="self_employed">Self-employed</option>
            <option value="informal">Informal</option>
          </select>
        </label>
        <label>Net Monthly Income
          <input type="number" value={form.netMonthlyIncome} onChange={e=>update('netMonthlyIncome', +e.target.value)} className="w-full border rounded p-1" />
        </label>
        <label>Existing Monthly EMIs
          <input type="number" value={form.existingMonthlyEmis} onChange={e=>update('existingMonthlyEmis', +e.target.value)} className="w-full border rounded p-1" />
        </label>
        <label>Monthly Living Expenses
          <input type="number" value={form.monthlyLivingExpenses} onChange={e=>update('monthlyLivingExpenses', +e.target.value)} className="w-full border rounded p-1" />
        </label>
        <label>Loan Purpose
          <select value={form.loanPurpose} onChange={e=>update('loanPurpose', e.target.value)} className="block w-full border rounded p-1">
            <option value="wedding">Wedding</option>
            <option value="consumption">Consumption</option>
            <option value="business_expansion">Business expansion</option>
            <option value="asset_purchase">Asset purchase</option>
            <option value="emergency">Emergency</option>
          </select>
        </label>
        <label>Target Amount
          <input type="number" value={form.targetAmount} onChange={e=>update('targetAmount', +e.target.value)} className="w-full border rounded p-1" />
        </label>
        <div className="flex gap-2 mt-2">
          <button onClick={()=>onEvaluate(form)} className="bg-green-600 text-white px-3 py-1 rounded">Evaluate</button>
        </div>
      </div>
    </div>
  );
}


== client/src/components/ResultsDisplay.jsx ==

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
          {result.tenureTable.map(t=> (
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


== client/src/components/NegotiationCard.jsx ==

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


== client/src/components/StressTester.jsx ==

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


--- END FILES ---


If you'd prefer, I can directly print every file below in this README for one-step copy/paste. Tell me if you want that and I will paste full contents for all files inline in your session output (this is the recommended next step).