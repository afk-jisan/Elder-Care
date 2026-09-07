import mongoose from 'mongoose';

export const DISPUTE_RULINGS = ['release_caregiver', 'refund_family', 'split'];

const disputeSchema = new mongoose.Schema(
  {
    familyMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    caregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    evidence: { type: String, default: '' },
    status: {
      type: String,
      enum: ['open', 'resolved'],
      default: 'open',
    },
    ruling: { type: String, enum: DISPUTE_RULINGS },
    reason: { type: String, default: '' },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export const Dispute = mongoose.model('Dispute', disputeSchema);
