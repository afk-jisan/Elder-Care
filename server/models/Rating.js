import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalSession',
      required: true,
      unique: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    familyMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, default: '', maxlength: 300 },
  },
  { timestamps: true }
);

export const Rating = mongoose.model('Rating', ratingSchema);
