import express from 'express';
import Recipe from '../models/Recipe.js';
import { authMiddleware } from '../middleware/auth.js';
import { getCurrentSeason } from '../services/seasonService.js';
import { scaleRecipeIngredients } from '../services/groceryService.js';
import { updatePreferences } from '../services/aiService.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { region, season, occasion, mealType, tags, regionBased, search } = req.query;
    const conditions = [];

    if (mealType) conditions.push({ mealType });

    if (tags) {
      conditions.push({ tags: { $in: tags.split(',') } });
    }

    const activeSeason = season || getCurrentSeason();
    if (season) {
      conditions.push({ $or: [{ seasons: activeSeason }, { seasons: 'all' }] });
    }

    if (regionBased === 'true' && region) {
      conditions.push({ $or: [{ region }, { region: null }] });
    } else if (region) {
      conditions.push({ $or: [{ region }, { region: null }] });
    }

    if (occasion) {
      conditions.push({ occasions: occasion });
    }

    if (search) {
      conditions.push({
        $or: [
          { nameEn: { $regex: search, $options: 'i' } },
          { nameUr: { $regex: search, $options: 'i' } },
        ],
      });
    }

    const query = conditions.length ? { $and: conditions } : {};

    const recipes = await Recipe.find(query)
      .populate('region occasions')
      .sort({ nameEn: 1 });

    res.json(recipes);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { guestCount } = req.query;
    const recipe = await Recipe.findById(req.params.id).populate('region occasions');
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const result = recipe.toObject();
    if (guestCount) {
      result.scaledIngredients = scaleRecipeIngredients(recipe, Number(guestCount));
      result.scaledFor = Number(guestCount);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/like', authMiddleware, async (req, res, next) => {
  try {
    const prefs = await updatePreferences(req.userId, req.params.id, 'like');
    res.json({ message: 'Preference saved', preferences: prefs });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/skip', authMiddleware, async (req, res, next) => {
  try {
    const prefs = await updatePreferences(req.userId, req.params.id, 'skip');
    res.json({ message: 'Preference saved', preferences: prefs });
  } catch (error) {
    next(error);
  }
});

export default router;
