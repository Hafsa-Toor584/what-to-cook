# What to Cook

A bilingual (English/Urdu) full-stack meal planning app for Pakistani home cooking.

## Features

- Daily, weekly, monthly, and guest meal plans
- Pakistan region-based filtering (optional)
- Seasonal and festival/occasion dish discovery
- Recipe steps and auto-generated grocery lists
- Guest headcount scaling for servings and groceries
- Hybrid AI assistant: question wizard + OpenAI suggestions
- Preference learning over time

## Stack

- **Frontend:** React, Vite, Tailwind CSS, react-i18next
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **AI:** OpenAI API (optional, wizard works without it)

## Setup

### Prerequisites

- Node.js 18+
- MongoDB running locally or MongoDB Atlas URI

### Install

```bash
npm run install:all
```

### Environment

Copy `server/.env.example` to `server/.env` and set:

```
MONGODB_URI=mongodb://127.0.0.1:27017/what-to-cook
JWT_SECRET=your-long-random-secret
OPENAI_API_KEY=your-openai-key   # optional
PORT=5000
```

### Seed database

```bash
npm run seed
```

### Run development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### MongoDB Atlas: allow your IP (required once)

If you see **"IP isn't whitelisted"**, in [MongoDB Atlas](https://cloud.mongodb.com):

1. Open your project → **Network Access** (left sidebar)
2. **Add IP Address** → **Add Current IP Address** → Confirm  
   Or for dev only: **Allow Access from Anywhere** (`0.0.0.0/0`)
3. Wait 1–2 minutes, then restart `npm run dev`

Your app's connection string goes in `server/.env` as `MONGODB_URI` (see `.env.example`).

## Project Structure

```
what-to-cook/
├── client/     # React frontend
├── server/     # Express API
└── package.json
```

## Default Flow

1. Register / Login
2. Choose plan type (Today, Week, Month, Guests)
3. Pick dishes or use "Help me decide" wizard
4. View recipes and grocery lists

## Production (Phase A)

To put the app online for phones and real users, follow **[DEPLOY.md](./DEPLOY.md)**.

Includes: Render API + Vercel frontend, secrets, CORS, rate limits, and a phone smoke-test checklist.
