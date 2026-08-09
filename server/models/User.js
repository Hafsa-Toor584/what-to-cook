import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    preferredLanguage: { type: String, enum: ['en', 'ur'], default: 'en' },
    preferredRegion: { type: mongoose.Schema.Types.ObjectId, ref: 'Region', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
