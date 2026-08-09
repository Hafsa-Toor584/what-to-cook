import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema(
  {
    nameEn: String,
    nameUr: String,
    quantity: Number,
    unit: String,
  },
  { _id: false }
);

const stepSchema = new mongoose.Schema(
  {
    stepEn: String,
    stepUr: String,
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    nameEn: { type: String, required: true },
    nameUr: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    region: { type: mongoose.Schema.Types.ObjectId, ref: 'Region', default: null },
    seasons: {
      type: [String],
      enum: ['winter', 'summer', 'monsoon', 'spring', 'all'],
      default: ['all'],
    },
    occasions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Occasion' }],
    ingredients: [ingredientSchema],
    steps: [stepSchema],
    prepTimeMinutes: { type: Number, default: 30 },
    servings: { type: Number, default: 4 },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink'],
      default: 'lunch',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Recipe', recipeSchema);
