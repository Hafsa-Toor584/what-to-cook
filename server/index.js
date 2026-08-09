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

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    if (error.message.includes('whitelist') || error.message.includes('IP')) {
      printAtlasHelp();
    }
    process.exit(1);
  }
}

start();
