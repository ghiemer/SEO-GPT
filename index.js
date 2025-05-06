require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// 🔒 Middleware zur API-Key-Prüfung
app.use((req, res, next) => {
  const clientKey = req.headers['x-api-key'];
  if (!clientKey || clientKey !== process.env.PROXY_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
  }
  next();
});

// 🧾 Auth-Header vorbereiten
const getAuthHeaders = () => {
  const auth = Buffer.from(`${process.env.DATAFORSEO_EMAIL}:${process.env.DATAFORSEO_PASSWORD}`).toString('base64');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${auth}`
  };
};

// 🧠 Hilfsfunktion: Array in tasks-Objekt umwandeln
const toTaskObject = (taskArray) => {
  const out = {};
  taskArray.forEach((item, idx) => {
    out[idx.toString()] = item;
  });
  return out;
};

// 🔍 1. Keyword Search Volume
app.post('/api/search-volume', async (req, res) => {
  try {
    const payload = { tasks: toTaskObject(req.body.tasks) };
    const response = await axios.post(
      'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live',
      payload,
      { headers: getAuthHeaders() }
    );
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: err.message,
      details: err.response?.data
    });
  }
});

// 💡 2. Keyword Suggestions
app.post('/api/keyword-suggestions', async (req, res) => {
  try {
    const payload = { tasks: toTaskObject(req.body.tasks) };
    const response = await axios.post(
      'https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live',
      payload,
      { headers: getAuthHeaders() }
    );
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: err.message,
      details: err.response?.data
    });
  }
});

// 🔎 3. SERP Analysis
app.post('/api/serp-analysis', async (req, res) => {
  try {
    const payload = { tasks: toTaskObject(req.body.tasks) };
    const response = await axios.post(
      'https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
      payload,
      { headers: getAuthHeaders() }
    );
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: err.message,
      details: err.response?.data
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ DataForSEO Proxy läuft auf Port ${PORT}`);
});
