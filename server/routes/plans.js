import express from 'express';
import MealPlan from '../models/MealPlan.js';
import Recipe from '../models/Recipe.js';
import { authMiddleware } from '../middleware/auth.js';
import { aggregateGroceries } from '../services/groceryService.js';

const router = express.Router();

function buildDays(type, startDate) {
  const days = [];
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  let count = 1;
  if (type === 'weekly') count = 7;
  if (type === 'monthly') count = 30;

  for (let i = 0; i < count; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push({ date, meals: { breakfast: [], lunch: [], dinner: [] } });
  }

  return days;
}

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const plans = await MealPlan.find({ userId: req.userId })
      .populate('occasionId regionFilter.regionId')
      .sort({ updatedAt: -1 });
    res.json(plans);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const plan = await MealPlan.findOne({ _id: req.params.id, userId: req.userId })
      .populate({
        path: 'days.meals.breakfast days.meals.lunch days.meals.dinner',
        populate: { path: 'region occasions' },
      })
      .populate('occasionId regionFilter.regionId');

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.json(plan);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { type, startDate, regionFilter, occasionId, guestCount, isGuestMenu } = req.body;

    const plan = await MealPlan.create({
      userId: req.userId,
      type,
      startDate: startDate || new Date(),
      regionFilter: regionFilter || { enabled: false, regionId: null },
      occasionId: occasionId || null,
      guestCount: guestCount || null,
      isGuestMenu: isGuestMenu || type === 'guest',
      days: buildDays(type, startDate || new Date()),
    });

    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const plan = await MealPlan.findOne({ _id: req.params.id, userId: req.userId });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const { days, guestCount, occasionId, regionFilter } = req.body;
    if (days) plan.days = days;
    if (guestCount !== undefined) plan.guestCount = guestCount;
    if (occasionId !== undefined) plan.occasionId = occasionId;
    if (regionFilter) plan.regionFilter = regionFilter;

    await plan.save();

    const populated = await MealPlan.findById(plan._id)
      .populate({
        path: 'days.meals.breakfast days.meals.lunch days.meals.dinner',
        populate: { path: 'region occasions' },
      })
      .populate('occasionId regionFilter.regionId');

    res.json(populated);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/groceries', async (req, res, next) => {
  try {
    const plan = await MealPlan.findOne({ _id: req.params.id, userId: req.userId });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const recipeIds = new Set();
    for (const day of plan.days) {
      for (const slot of ['breakfast', 'lunch', 'dinner']) {
        for (const id of day.meals[slot] || []) {
          recipeIds.add(id.toString());
        }
      }
    }

    const recipes = await Recipe.find({ _id: { $in: Array.from(recipeIds) } });
    const groceries = aggregateGroceries(recipes, plan.guestCount);

    res.json({
      guestCount: plan.guestCount,
      itemCount: groceries.length,
      items: groceries,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
