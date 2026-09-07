import mongoose from 'mongoose';

const elderSchema = new mongoose.Schema(
  {
    familyMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Elder = mongoose.model('Elder', elderSchema);
