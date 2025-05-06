require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// 🔒 API-Key Middleware
app.use((req, res, next) => {
  const clientKey = req.headers['x-api-key'];
  if (!clientKey || clientKey !== process.env.PROXY_API_KEY) {
    console.warn('❌ Zugriff verweigert – ungültiger oder fehlender API-Key');
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
  }
  next();
});

// 🧾 Basic Auth Header vorbereiten
const getAuthHeaders = () => {
  const auth = Buffer.from(`${process.env.DATAFORSEO_EMAIL}:${process.env.DATAFORSEO_PASSWORD}`).toString('base64');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${auth}`
  };
};

// 🧠 normalizeTasks: akzeptiert Array oder Objekt
const normalizeTasks = (input) => {
  if (Array.isArray(input)) {
    const out = {};
    input.forEach((item, idx) => {
      out[idx.toString()] = item;
    });
    return out;
  }
  if (typeof input === 'object' && input !== null) {
    return input;
  }
  throw new Error("Invalid 'tasks' format. Must be an array or object.");
};

// 🛠 Generische Handler-Funktion mit Logging
const handleProxyRequest = async (req, res, url, label) => {
  try {
    console.log(`📥 ${label}: Eingehender Request`, JSON.stringify(req.body, null, 2));

    const payload = { tasks: normalizeTasks(req.body.tasks) };
    console.log(`📤 ${label}: Weitergeleitet an DataForSEO`, JSON.stringify(payload, null, 2));

    const response = await axios.post(url, payload, { headers: getAuthHeaders() });

    console.log(`✅ ${label}: Erfolgreiche Antwort erhalten`);
    res.status(response.status).json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    console.error(`❌ ${label}: Fehler bei Anfrage (${status})`);
    if (err.response?.data) {
      console.error('Fehlerdetails:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Fehler:', err.message);
    }

    res.status(status).json({
      error: err.message,
      details: err.response?.data || null
    });
  }
};

// 🔍 1. Keyword Search Volume
app.post('/api/search-volume', async (req, res) => {
  await handleProxyRequest(
    req,
    res,
    'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live',
    'SearchVolume'
  );
});

// 💡 2. Keyword Suggestions
app.post('/api/keyword-suggestions', async (req, res) => {
  await handleProxyRequest(
    req,
    res,
    'https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live',
    'KeywordSuggestions'
  );
});

// 🔎 3. SERP Analysis
app.post('/api/serp-analysis', async (req, res) => {
  await handleProxyRequest(
    req,
    res,
    'https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
    'SERPAnalysis'
  );
});

// 🟢 Start
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ DataForSEO Proxy läuft auf Port ${PORT}`);
});
