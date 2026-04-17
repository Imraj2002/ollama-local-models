const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { validateContent, validateProfile } = require('./services/ollamaService');

console.log('[Server] Starting initialization...');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('[Server] Configuring middlewares...');
app.use(cors());
app.use(express.json());

// API Endpoints
app.post('/api/validate', async (req, res) => {
  console.log('[Server] POST /api/validate received');
  try {
    const result = await validateContent(req.body.text);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/validate-profile', async (req, res) => {
  console.log('[Server] POST /api/validate-profile received');
  try {
    const result = await validateProfile(req.body.profile);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

console.log(`[Server] Attempting to listen on port ${PORT}...`);
app.listen(PORT, (err) => {
  if (err) {
    console.error('[Server] CRITICAL: Failed to listen:', err);
    return;
  }
  console.log(`[Server] Listening successfully on http://localhost:${PORT}`);
});

// Extra keep-alive for some environments
setInterval(() => {
  // Just keeping the event loop occupied
}, 60000);
