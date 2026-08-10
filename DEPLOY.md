# Phase A — Deploy to production

Goal: app works on a phone over the internet (not only on your laptop).

## Architecture

| Piece | Suggested host | Notes |
|-------|----------------|-------|
| Frontend (`client/`) | [Vercel](https://vercel.com) | Free tier works |
| Backend (`server/`) | [Render](https://render.com) | Free web service |
| Database | MongoDB Atlas | You already use this |

```
Phone browser → Vercel (React) → Render API → MongoDB Atlas
                              ↘ OpenAI (optional)
```

---

## 1. Prepare secrets

Generate a strong JWT secret (PowerShell):

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

Keep these ready:

- `MONGODB_URI` — from Atlas
- `JWT_SECRET` — long random string (32+ chars)
- `CLIENT_URL` — your Vercel URL (add after frontend deploy)
- `OPENAI_API_KEY` — optional
- `VITE_API_URL` — your Render API URL (no trailing slash)

**Rotate Atlas password** if it was ever pasted into chat.

### Atlas Network Access

In Atlas → **Network Access**:

- For Render free tier, allow `0.0.0.0/0` (all IPs), **or**
- Add the outbound IPs Render shows for your service

Without this, production API cannot reach MongoDB.

---

## 2. Deploy the API (Render)

1. Push this repo to GitHub.
2. Render → **New** → **Blueprint** (uses `render.yaml`), **or** New Web Service:
   - Root directory: `server`
   - Build: `npm install`
   - Start: `npm start`
   - Health check: `/api/health`
3. Set env vars:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | your Atlas URI |
| `JWT_SECRET` | strong secret |
| `CLIENT_URL` | `https://YOUR-APP.vercel.app` (update after step 3) |
| `OPENAI_API_KEY` | optional |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `MAIL_FROM` | optional, enables password reset emails |

4. Deploy and open `https://YOUR-API.onrender.com/api/health`  
   You should see `{ "status": "ok", ... }`.

> Free Render services sleep after idle time. First request can take ~30–60s.

---

## 3. Deploy the frontend (Vercel)

1. Vercel → **Add New Project** → import the GitHub repo.
2. Framework: Vite  
   Root directory: `client`  
   Build command: `npm run build`  
   Output: `dist`
3. Environment variable:

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://YOUR-API.onrender.com` (no trailing slash) |

4. Deploy. Note the URL, e.g. `https://what-to-cook.vercel.app`.
5. Go back to Render and set `CLIENT_URL` to that exact URL (include `https://`). Redeploy API if needed.

`client/vercel.json` already handles React Router refresh on deep links.

---

## 4. Seed production data (once)

From your laptop (with production `MONGODB_URI` in `server/.env`):

```bash
cd server
npm run seed
```

This wipes and reseeds recipes in that database — only run when you intend to reset data.

---

## 5. Phone checklist

- [ ] Open the Vercel URL on your phone (Wi‑Fi or mobile data)
- [ ] Register a new account
- [ ] Log out / log back in
- [ ] Browse dishes and open a recipe
- [ ] Tap **Help me decide**

If login fails with CORS: `CLIENT_URL` on Render must match the Vercel origin exactly.

If API hangs forever: Render may be waking up — wait and retry.

---

## 6. Password reset emails (optional)

Password reset works without email, but the link is only printed in the server logs.

> **Gmail SMTP does not work on Render's free tier.** Free services cannot send
> outbound traffic on ports 25, 465, or 587, so the connection hangs and times out.
> Use an HTTP email API instead (below), or upgrade to a paid Render instance.

### Brevo (recommended: free tier, no domain needed)

1. Sign up at [brevo.com](https://www.brevo.com) with the address you want mail to come from.
2. Verify that address (Senders → add and confirm the emailed link).
3. Create an API key: **SMTP & API → API keys → Generate**.
4. On Render → Environment:

| Key | Value |
|-----|--------|
| `BREVO_API_KEY` | your API key |
| `MAIL_FROM` | `What to Cook <your-verified@email.com>` |

5. Save. Render redeploys automatically.

`RESEND_API_KEY` works the same way if you prefer [Resend](https://resend.com),
though sending to addresses other than your own requires a verified domain there.

### SMTP (local development, or paid Render instances)

| Key | Value |
|-----|--------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | your Gmail address |
| `SMTP_PASS` | 16-character Gmail app password |
| `MAIL_FROM` | `What to Cook <your@gmail.com>` |

An HTTP API key takes priority over SMTP when both are set.

Reset links point at `CLIENT_URL`, so that must be your Vercel URL.
Links expire after 1 hour and can only be used once.

---

## 7. Custom domain (optional)

1. Buy a domain (Namecheap, Cloudflare, etc.).
2. In Vercel → Project → Domains → add `app.yourdomain.com`.
3. Update Render `CLIENT_URL` to the new origin.
4. Redeploy API.

---

## Local development (unchanged)

```bash
npm run install:all
npm run dev
```

- Leave `client` `VITE_API_URL` empty (uses Vite proxy).
- `NODE_ENV` should stay unset or `development` so CORS stays open locally.

---

## What Phase A already includes in code

- Helmet security headers
- Rate limits on API, auth, and AI routes
- Production CORS allow-list via `CLIENT_URL`
- Stronger password hashing + basic validation
- Production env validation (weak JWT / missing CORS rejected)
- Client production API base URL (`VITE_API_URL`)
- Mobile-friendly viewport / theme color
- Deploy configs: `render.yaml`, `client/vercel.json`
