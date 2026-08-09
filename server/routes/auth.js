import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import UserPreference from '../models/UserPreference.js';
import { authMiddleware, attachUser } from '../middleware/auth.js';
import { authLimiter } from '../middleware/security.js';

const router = express.Router();

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
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
