import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import regionRoutes from './routes/regions.js';
import occasionRoutes from './routes/occasions.js';
import recipeRoutes from './routes/recipes.js';
import planRoutes from './routes/plans.js';
import aiRoutes from './routes/ai.js';
import preferenceRoutes from './routes/preferences.js';
import { getCurrentSeason, getSeasonLabel } from './services/seasonService.js';
import { loadEnv } from './loadEnv.js';
import { applySecurity, apiLimiter, aiLimiter, validateEnv } from './middleware/security.js';

loadEnv();
validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

applySecurity(app);
app.use(express.json({ limit: '100kb' }));
app.use('/api', apiLimiter);

app.get('/', (_req, res) => {
  // #region agent log
  fetch('http://127.0.0.1:7344/ingest/4721d593-5167-4872-9806-12e34c51eade',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d84713'},body:JSON.stringify({sessionId:'d84713',runId:'root-route',hypothesisId:'A',location:'server/index.js:/',message:'Root route hit',data:{},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  res.json({
    name: 'What to Cook API',
    status: 'ok',
    health: '/api/health',
  });
});

app.get('/api/health', (_req, res) => {
  const season = getCurrentSeason();
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
    season,
    seasonLabel: {
      en: getSeasonLabel(season, 'en'),
      ur: getSeasonLabel(season, 'ur'),
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/occasions', occasionRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/preferences', preferenceRoutes);

app.use((err, _req, res, _next) => {
  if (err?.message?.startsWith('CORS blocked')) {
    return res.status(403).json({ message: err.message });
  }
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

function printAtlasHelp() {
  console.error('\n--- MongoDB Atlas fix (one-time setup) ---');
  console.error('1. Open https://cloud.mongodb.com → your project');
  console.error('2. Left menu: Network Access → Add IP Address');
  console.error('3. Click "Add Current IP Address" (or add 0.0.0.0/0 for dev only)');
  console.error('4. Wait 1–2 minutes, then restart: npm run dev');
  console.error('------------------------------------------\n');
}

function describeMongoUri(uri) {
  if (!uri) return { set: false };
  const trimmed = uri.trim();
  const info = {
    set: true,
    length: trimmed.length,
    hasSurroundingQuotes: /^["']/.test(trimmed) || /["']$/.test(trimmed),
    hasWhitespace: /\s/.test(trimmed),
    scheme: trimmed.startsWith('mongodb+srv://')
      ? 'mongodb+srv'
      : trimmed.startsWith('mongodb://')
        ? 'mongodb'
        : 'other',
  };
  try {
    const normalized = trimmed
      .replace(/^mongodb\+srv:\/\//, 'https://')
      .replace(/^mongodb:\/\//, 'https://');
    const parsed = new URL(normalized);
    info.user = decodeURIComponent(parsed.username || '');
    info.host = parsed.hostname;
    info.passLength = (parsed.password || '').length;
    info.hasDbName = Boolean(parsed.pathname && parsed.pathname !== '/');
  } catch {
    info.parseOk = false;
  }
  return info;
}

async function start() {
  // #region agent log
  fetch('http://127.0.0.1:7344/ingest/4721d593-5167-4872-9806-12e34c51eade',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d84713'},body:JSON.stringify({sessionId:'d84713',runId:'render-mongo',hypothesisId:'A',location:'server/index.js:start',message:'Mongo connect attempt (no secrets)',data:describeMongoUri(process.env.MONGODB_URI),timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('Connected to MongoDB');
    // #region agent log
    fetch('http://127.0.0.1:7344/ingest/4721d593-5167-4872-9806-12e34c51eade',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d84713'},body:JSON.stringify({sessionId:'d84713',runId:'render-mongo',hypothesisId:'A',location:'server/index.js:start',message:'Mongo connect ok',data:{},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    const uriInfo = describeMongoUri(process.env.MONGODB_URI);
    console.error('Mongo URI check (no password):', JSON.stringify(uriInfo));
    // #region agent log
    fetch('http://127.0.0.1:7344/ingest/4721d593-5167-4872-9806-12e34c51eade',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d84713'},body:JSON.stringify({sessionId:'d84713',runId:'render-mongo',hypothesisId:'A',location:'server/index.js:start',message:'Mongo connect failed',data:{err:error.message,uriInfo},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (
      error.message.includes('bad auth') ||
      error.message.includes('Authentication failed')
    ) {
      console.error(
        'Fix: Render Environment → MONGODB_URI must match Atlas DB user password exactly (copy from local server/.env). No quotes. Reset password in Atlas → Database Access if unsure.'
      );
    }
    if (error.message.includes('whitelist') || error.message.includes('IP')) {
      printAtlasHelp();
    }
    process.exit(1);
  }
}

start();
