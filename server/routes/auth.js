import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import UserPreference from '../models/UserPreference.js';
import { authMiddleware, attachUser } from '../middleware/auth.js';
import { authLimiter } from '../middleware/security.js';
import { isMailConfigured, sendMail } from '../services/mailer.js';

const router = express.Router();

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function hashResetToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

function buildResetUrl(token) {
  const origin = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')[0]
    .trim()
    .replace(/\/$/, '');
  return `${origin}/reset-password?token=${token}`;
}

function resetEmail(url, lang) {
  if (lang === 'ur') {
    return {
      subject: 'کیا پکائیں — پاس ورڈ دوبارہ سیٹ کریں',
      text: `پاس ورڈ بدلنے کے لیے اس لنک پر جائیں:\n${url}\n\nیہ لنک ایک گھنٹے میں ختم ہو جائے گا۔ اگر آپ نے درخواست نہیں کی تو اس ای میل کو نظر انداز کریں۔`,
    };
  }
  return {
    subject: 'What to Cook — reset your password',
    text: `Open this link to set a new password:\n${url}\n\nThe link expires in 1 hour. If you did not ask for this, you can ignore this email.`,
  };
}

router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { name, email, password, preferredLanguage } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ message: 'Enter a valid email' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      preferredLanguage: preferredLanguage || 'en',
    });

    await UserPreference.create({ userId: user._id });

    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
        preferredRegion: user.preferredRegion,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
        preferredRegion: user.preferredRegion,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/forgot-password', authLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Same reply whether or not the email exists, so accounts cannot be discovered here
    const reply = { message: 'If that email is registered, a reset link is on its way.' };
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.json(reply);
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetTokenHash = hashResetToken(token);
    user.resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();

    const url = buildResetUrl(token);
    const { subject, text } = resetEmail(url, user.preferredLanguage);

    if (!isMailConfigured()) {
      console.warn(`Password reset link for ${user.email}: ${url}`);
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({
          message: 'Password reset email is not set up yet. Please contact support.',
        });
      }
      return res.json({ ...reply, resetUrl: url });
    }

    try {
      await sendMail({ to: user.email, subject, text });
    } catch (mailError) {
      console.error('Reset email failed:', mailError.message);
      return res.status(502).json({ message: 'Could not send the reset email. Try again later.' });
    }

    res.json(reply);
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', authLimiter, async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      resetTokenHash: hashResetToken(token),
      resetTokenExpiresAt: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired' });
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetTokenHash = null;
    user.resetTokenExpiresAt = null;
    await user.save();

    res.json({
      token: signToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
        preferredRegion: user.preferredRegion,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authMiddleware, attachUser, (req, res) => {
  res.json({ user: req.user });
});

router.patch('/me', authMiddleware, attachUser, async (req, res, next) => {
  try {
    const { preferredLanguage, preferredRegion, name } = req.body;
    if (preferredLanguage) req.user.preferredLanguage = preferredLanguage;
    if (preferredRegion !== undefined) req.user.preferredRegion = preferredRegion || null;
    if (name) req.user.name = name;
    await req.user.save();
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
});

export default router;
