import mongoose from 'mongoose';
import Region from '../models/Region.js';
import Occasion from '../models/Occasion.js';
import Recipe from '../models/Recipe.js';
import { regions, occasions, buildRecipes } from './seedData.js';
import { imageFor } from './recipeImages.js';
import { loadEnv } from '../loadEnv.js';

loadEnv();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/what-to-cook');
    console.log('Connected to MongoDB');

    await Promise.all([Region.deleteMany({}), Occasion.deleteMany({}), Recipe.deleteMany({})]);

    const createdRegions = await Region.insertMany(regions);
    const regionMap = Object.fromEntries(createdRegions.map((r) => [r.slug, r._id]));

    const createdOccasions = await Occasion.insertMany(occasions);
    const occasionMap = Object.fromEntries(createdOccasions.map((o) => [o.slug, o._id]));

    const recipeData = buildRecipes(regionMap, occasionMap).map((recipe) => ({
      ...recipe,
      imageUrl: imageFor(recipe.nameEn),
      region: recipe.region || null,
      occasions: (recipe.occasions || []).filter(Boolean),
    }));

    await Recipe.insertMany(recipeData);

    console.log(`Seeded ${createdRegions.length} regions, ${createdOccasions.length} occasions, ${recipeData.length} recipes`);
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
