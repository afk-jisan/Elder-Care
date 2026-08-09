import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema(
  {
    familyMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    monthlyBudget: { type: Number, default: 0 },
    remainingBudget: { type: Number, default: 0 },
    categoryLimits: {
      groceries: { type: Number, default: 0 },
      medicine: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const Wallet = mongoose.model('Wallet', walletSchema);
