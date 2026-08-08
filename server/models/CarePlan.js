import mongoose from 'mongoose';

export const CARE_PACKAGES = ['Companion', 'Medical', 'Errand'];
export const CARE_PLAN_STATUSES = [
  'draft',
  'pending_acceptance',
  'active',
  'rejected',
];

const carePlanSchema = new mongoose.Schema(
  {
    familyMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    elderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Elder',
      required: true,
      index: true,
    },
    package: {
      type: String,
      enum: CARE_PACKAGES,
      required: true,
    },
    caregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: CARE_PLAN_STATUSES,
      default: 'draft',
    },
    startDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const CarePlan = mongoose.model('CarePlan', carePlanSchema);
