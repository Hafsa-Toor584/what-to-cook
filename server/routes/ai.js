import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import UserPreference from '../models/UserPreference.js';
import { filterRecipesByWizard, getAISuggestions, explainRecipe } from '../services/aiService.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/suggest', async (req, res, next) => {
  try {
    const { wizardAnswers, planType, guestCount, language, useAI = true } = req.body;

    if (useAI) {
      const result = await getAISuggestions({
        userId: req.userId,
        wizardAnswers,
        planType,
        guestCount,
        language,
        useAI: true,
      });
      return res.json(result);
    }

    const prefs = await UserPreference.findOne({ userId: req.userId });
    const suggestions = await filterRecipesByWizard(wizardAnswers, prefs?.skippedRecipes || []);
    res.json({ source: 'wizard', suggestions });
  } catch (error) {
    next(error);
  }
});

router.post('/explain', async (req, res, next) => {
  try {
    const { recipeId, language } = req.body;
    const result = await explainRecipe({ userId: req.userId, recipeId, language });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
