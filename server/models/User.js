import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    preferredLanguage: { type: String, enum: ['en', 'ur'], default: 'en' },
    preferredRegion: { type: mongoose.Schema.Types.ObjectId, ref: 'Region', default: null },
    resetTokenHash: { type: String, default: null, select: false },
    resetTokenExpiresAt: { type: Date, default: null, select: false },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
