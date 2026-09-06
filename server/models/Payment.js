import mongoose from 'mongoose';

export const PAYMENT_TYPES = [
  'escrow_load',
  'task_release',
  'manual_release',
  'utility_bill',
  'refund',
];

export const PAYMENT_STATUSES = [
  'pending',
  'completed',
  'failed',
  'held',
  'refunded',
];

const paymentSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      index: true,
    },
    familyMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    caregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    amount: { type: Number, required: true },
    type: { type: String, enum: PAYMENT_TYPES, required: true },
    status: { type: String, enum: PAYMENT_STATUSES, default: 'completed' },
    category: { type: String, default: 'other' },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    otpRequired: { type: Boolean, default: false },
    otpVerified: { type: Boolean, default: false },
    otpCode: { type: String, default: '' },
    receiptUrl: { type: String, default: '' },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
