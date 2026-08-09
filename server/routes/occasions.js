import express from 'express';
import Occasion from '../models/Occasion.js';

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const occasions = await Occasion.find().sort({ nameEn: 1 });
    res.json(occasions);
  } catch (error) {
    next(error);
  }
});

export default router;
