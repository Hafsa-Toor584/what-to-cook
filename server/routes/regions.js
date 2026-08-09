import express from 'express';
import Region from '../models/Region.js';

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const regions = await Region.find().sort({ nameEn: 1 });
    res.json(regions);
  } catch (error) {
    next(error);
  }
});

export default router;
