import express from 'express';
import UserPreference from '../models/UserPreference.js';
import Recipe from '../models/Recipe.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    let prefs = await UserPreference.findOne({ userId: req.userId })
      .populate('likedRecipes', 'nameEn nameUr imageUrl tags');

    if (!prefs) {
      prefs = await UserPreference.create({ userId: req.userId });
    }

    res.json(prefs);
  } catch (error) {
    next(error);
  }
});

export default router;
