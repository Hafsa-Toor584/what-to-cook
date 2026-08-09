import mongoose from 'mongoose';

const wizardHistorySchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    answers: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const userPreferenceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    likedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
    skippedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
    inferredTags: {
      prefersMeat: { type: Boolean, default: false },
      prefersQuick: { type: Boolean, default: false },
      preferredRegion: { type: String, default: null },
    },
    wizardHistory: [wizardHistorySchema],
    aiRequestCount: { type: Number, default: 0 },
    aiRequestDate: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('UserPreference', userPreferenceSchema);
