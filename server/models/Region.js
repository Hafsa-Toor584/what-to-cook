import mongoose from 'mongoose';

const regionSchema = new mongoose.Schema(
  {
    nameEn: { type: String, required: true },
    nameUr: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model('Region', regionSchema);
