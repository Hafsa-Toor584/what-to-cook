import mongoose from 'mongoose';

const mealSlotSchema = new mongoose.Schema(
  {
    breakfast: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
    lunch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
    dinner: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  },
  { _id: false }
);

const daySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    meals: { type: mealSlotSchema, default: () => ({}) },
  },
  { _id: false }
);

const mealPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'guest'],
      required: true,
    },
    startDate: { type: Date, required: true },
    regionFilter: {
      enabled: { type: Boolean, default: false },
      regionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Region', default: null },
    },
    occasionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Occasion', default: null },
    guestCount: { type: Number, default: null },
    isGuestMenu: { type: Boolean, default: false },
    days: [daySchema],
  },
  { timestamps: true }
);

export default mongoose.model('MealPlan', mealPlanSchema);
