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
