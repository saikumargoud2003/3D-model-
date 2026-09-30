// server/src/routes/copilot.js
const express = require('express');
const router = express.Router();
const { evaluateHandler, presetsHandler } = require('../controllers/copilot');

router.post('/evaluate', evaluateHandler);
router.get('/presets', presetsHandler);

module.exports = router;
