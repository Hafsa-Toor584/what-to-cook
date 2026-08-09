import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

function parseOrigins() {
  const raw = process.env.CLIENT_URL || process.env.CORS_ORIGINS || '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function applySecurity(app) {
  const isProd = process.env.NODE_ENV === 'production';
  const origins = parseOrigins();

  // Needed so rate limits work correctly behind Render/Railway proxies
  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    })
  );

  app.use(
    cors({
      origin(origin, callback) {
        // Allow non-browser tools (curl/Postman) with no Origin header
        if (!origin) return callback(null, true);
        // Dev: allow Vite and local previews
        if (!isProd) return callback(null, true);
        if (origins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    })
  );
}

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again in 15 minutes.' },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down.' },
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'AI rate limit reached. Try again later.' },
});

export function validateEnv() {
  const missing = [];
  if (!process.env.MONGODB_URI) missing.push('MONGODB_URI');
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');

  if (missing.length) {
    console.error(`Missing required env: ${missing.join(', ')}`);
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production') {
    const weakSecrets = [
      'change-this-to-a-long-random-secret',
      'what-to-cook-dev-secret-change-in-production',
      'your-long-random-secret',
    ];
    if (weakSecrets.includes(process.env.JWT_SECRET) || process.env.JWT_SECRET.length < 24) {
      console.error('JWT_SECRET is too weak for production. Use a long random string (32+ chars).');
      process.exit(1);
    }
    if (!process.env.CLIENT_URL && !process.env.CORS_ORIGINS) {
      console.error('Set CLIENT_URL (or CORS_ORIGINS) in production, e.g. https://your-app.vercel.app');
      process.exit(1);
    }
  }
}
