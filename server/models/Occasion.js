import mongoose from 'mongoose';

const occasionSchema = new mongoose.Schema(
  {
    nameEn: { type: String, required: true },
    nameUr: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String, default: '🎉' },
    type: {
      type: String,
      enum: ['festival', 'religious', 'social', 'seasonal'],
      default: 'social',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Occasion', occasionSchema);
