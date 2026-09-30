// server/src/index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const net = require('net');
const { connectWithFallback } = require('./config/db');
const copilotRoutes = require('./routes/copilot');

const app = express();
app.use(cors());
app.use(bodyParser.json());

function isPortTaken(port) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once('error', () => resolve(true));
    tester.once('listening', () => {
      tester.close(() => resolve(false));
    });
    tester.listen(port, '127.0.0.1');
  });
}

async function getAvailablePort(startPort) {
  let port = startPort;
  while (await isPortTaken(port)) {
    port += 1;
  }
  return port;
}

// Connect to DB (falls back to seed data if no DB)
connectWithFallback().then((db) => {
  console.log('DB ready (may be in-memory fallback).');
});

app.use('/api', copilotRoutes);

(async () => {
  const preferredPort = Number(process.env.PORT || 5000);
  const PORT = await getAvailablePort(preferredPort);
  app.listen(PORT, () => {
    console.log(`Borrower Copilot server running on http://localhost:${PORT}`);
    if (PORT !== preferredPort) {
      console.warn(`Port ${preferredPort} was busy. Fallback host is http://localhost:${PORT}`);
    }
  });
})();
