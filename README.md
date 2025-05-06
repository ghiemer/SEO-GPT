# 📊 DataForSEO Proxy (for GPT Actions)

A secure and lightweight Node.js proxy that enables the use of the **DataForSEO API** with **GPT Actions**, even though GPT does not natively support HTTP Basic Auth.

---

### 🚀 Features

* 🔍 **Keyword Search Volume** (`/api/search-volume`)
* 💡 **Keyword Suggestions** (`/api/keyword-suggestions`)
* 🔎 **Google SERP Analysis** (`/api/serp-analysis`)

Fully compatible with **Render**, **OpenAI GPT Actions**, **OpenAPI 3.1.0**, and the **DataForSEO v3 API**.

---

## 📁 Project Structure

```
dataforseo-proxy/
├── index.js             # Main Express server with endpoints
├── package.json         # Dependencies & start script
├── .env.example         # Sample environment variables
├── README.md            # This documentation
```

---

## ⚙️ Local Installation

```bash
git clone https://github.com/yourname/dataforseo-proxy.git
cd dataforseo-proxy
cp .env.example .env
npm install
npm start
```

---

## 🌍 Environment Variables (.env)

```env
DATAFORSEO_EMAIL=your@email.com
DATAFORSEO_PASSWORD=your_api_password
PORT=8080
```

> You can find your credentials here:
> [https://app.dataforseo.com/api-access](https://app.dataforseo.com/api-access)

---

## ☁️ Deploy on Render

1. Go to [https://render.com](https://render.com)
2. Click "New Web Service"
3. Choose your GitHub repo or upload manually
4. Settings:

| Option           | Value            |
| ---------------- | ---------------- |
| Runtime          | Node.js          |
| Build Command    | `npm install`    |
| Start Command    | `npm start`      |
| Root Directory   | (leave empty)    |
| Environment Vars | From `.env` file |

> Once deployed, your base URL will look like:
> `https://dataforseo-proxy.onrender.com/api`

---

## 🤖 GPT Actions Integration

**Use these endpoints in your OpenAPI file:**

| Function              | Endpoint                        |
| --------------------- | ------------------------------- |
| Keyword Search Volume | `POST /api/search-volume`       |
| Keyword Suggestions   | `POST /api/keyword-suggestions` |
| SERP Analysis         | `POST /api/serp-analysis`       |

Set your `servers.url` in the OpenAPI config to:
`https://dataforseo-proxy.onrender.com/api`

---

## 🔐 Security

* API credentials are **never exposed** to GPT
* All authentication is handled **server-side** using HTTP Basic Auth
* The GPT only talks to your secure proxy, not to the DataForSEO API directly

---

## 📦 Example Request: Keyword Volume

```json
POST /api/search-volume

{
  "tasks": [
    {
      "keywords": ["heat pump", "solar panels"],
      "language_code": "de",
      "location_code": 2766
    }
  ]
}
```

---

## 📄 License

MIT © Gabriel Hiemer 2025
