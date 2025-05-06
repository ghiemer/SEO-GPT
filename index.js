require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Authentifizierungs-Header vorbereiten
const getAuthHeaders = () => {
  const auth = Buffer.from(`${process.env.DATAFORSEO_EMAIL}:${process.env.DATAFORSEO_PASSWORD}`).toString('base64');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${auth}`
  };
};

// 🔍 1. Keyword-Suchvolumen
app.post('/api/search-volume', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live',
      { tasks: req.body.tasks },
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

// 💡 2. Keyword-Vorschläge
app.post('/api/keyword-suggestions', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live',
      { tasks: req.body.tasks },
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

// 🔎 3. SERP-Analyse
app.post('/api/serp-analysis', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
      { tasks: req.body.tasks },
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
