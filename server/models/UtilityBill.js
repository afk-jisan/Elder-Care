import mongoose from 'mongoose';

export const UTILITY_PROVIDERS = [
  'DESCO',
  'WASA',
  'Titas Gas',
  'Internet',
];

const utilityBillSchema = new mongoose.Schema(
  {
    elderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Elder',
      required: true,
      index: true,
    },
    familyMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: { type: String, enum: UTILITY_PROVIDERS, required: true },
    accountNumber: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date },
    paid: { type: Boolean, default: false },
    billPhotoUrl: { type: String, default: '' },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    receiptUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export const UtilityBill = mongoose.model('UtilityBill', utilityBillSchema);
