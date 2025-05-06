require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// 🔒 API-Key Middleware mit erweiterten Logs
app.use((req, res, next) => {
  const clientKey = req.headers['x-api-key'];
  const expectedKey = process.env.PROXY_API_KEY;

  console.log('🔐 Auth-Check: API-Key (prefix):', clientKey ? clientKey.slice(0, 6) : '[none]');
  if (!clientKey) {
    console.warn('❌ Zugriff verweigert – kein API-Key übermittelt.');
    return res.status(401).json({ error: 'Unauthorized: Missing x-api-key header.' });
  }
  if (clientKey !== expectedKey) {
    console.warn('❌ Zugriff verweigert – ungültiger API-Key (prefix):', clientKey.slice(0, 6));
    return res.status(403).json({ error: 'Forbidden: Invalid API key.' });
  }

  console.log('✅ Authentifizierung erfolgreich.');
  next();
});

// 🧾 Basic Auth Header vorbereiten
const getAuthHeaders = () => {
  const auth = Buffer
    .from(`${process.env.DATAFORSEO_EMAIL}:${process.env.DATAFORSEO_PASSWORD}`)
    .toString('base64');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${auth}`
  };
};

// 🧠 normalizeTasks: akzeptiert Array oder Objekt, gibt immer Array zurück
const normalizeTasks = (input) => {
  if (Array.isArray(input)) {
    return input;
  }
  if (input && typeof input === 'object') {
    return Object.values(input);
  }
  throw new Error("Invalid 'tasks' format. Must be an array or object.");
};

// 🛠 Generischer Proxy-Handler mit Logging
const handleProxyRequest = async (req, res, url, label) => {
  try {
    console.log(`📥 ${label} - Eingehende Anfrage:`, JSON.stringify(req.body, null, 2));
    const tasksArray = normalizeTasks(req.body.tasks);
    const payload = { tasks: tasksArray };
    console.log(`📤 ${label} - Anfrage an DataForSEO:`, JSON.stringify(payload, null, 2));

    const response = await axios.post(url, payload, { headers: getAuthHeaders() });
    console.log(`✅ ${label} - Erfolgreiche Antwort erhalten.`);
    return res.status(response.status).json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    console.error(`❌ ${label} - Fehler bei Anfrage (${status}):`, err.message);
    if (err.response?.data) {
      console.error('↪️ Fehlerinhalt:', JSON.stringify(err.response.data, null, 2));
    }
    return res.status(status).json({
      error: err.message,
      details: err.response?.data || null
    });
  }
};

// 🔍 Endpoints
app.post('/api/search-volume', (req, res) =>
  handleProxyRequest(
    req,
    res,
    'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live',
    'SearchVolume'
  )
);

app.post('/api/keyword-suggestions', (req, res) =>
  handleProxyRequest(
    req,
    res,
    'https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live',
    'KeywordSuggestions'
  )
);

app.post('/api/serp-analysis', (req, res) =>
  handleProxyRequest(
    req,
    res,
    'https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
    'SERPAnalysis'
  )
);

// 🟢 Server-Start
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 DataForSEO Proxy läuft auf Port ${PORT}`));
