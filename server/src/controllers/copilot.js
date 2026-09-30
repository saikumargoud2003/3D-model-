// server/src/controllers/copilot.js
const { evaluateProfile } = require('../engine/rulesEngine');
const { getFallback } = require('../config/db');

const seedPresets = require('../data/seedPresets');
function getPresets() {
  const fallback = getFallback();
  if (fallback && fallback.presets) return fallback.presets;
  return seedPresets.presets || [];
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
