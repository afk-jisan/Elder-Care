import mongoose from 'mongoose';

const PROBATION_STATUSES = [
  'not_started',
  'in_probation',
  'passed',
  'failed',
];

const VETTING_STATUSES = ['pending', 'in_progress', 'activated', 'rejected'];

const referenceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    relation: { type: String, required: true, trim: true },
    note: { type: String, default: '', trim: true },
    verified: { type: Boolean, default: false },
  },
  { _id: false }
);

const caregiverVettingSchema = new mongoose.Schema(
  {
    caregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    nidVerified: { type: Boolean, default: false },
    nidNumber: { type: String, default: '', trim: true },
    nidVerifiedAt: { type: Date },
    nidVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    policeClearance: { type: Boolean, default: false },
    policeDocumentUrl: { type: String, default: '', trim: true },
    policeReviewedAt: { type: Date },
    policeReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referenceCheck: { type: Boolean, default: false },
    references: { type: [referenceSchema], default: [] },
    referencesReviewedAt: { type: Date },
    referencesReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    probationStatus: {
      type: String,
      enum: PROBATION_STATUSES,
      default: 'not_started',
    },
    probationNote: { type: String, default: '', trim: true },
    probationReviewedAt: { type: Date },
    probationReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: VETTING_STATUSES,
      default: 'pending',
    },
    activatedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String, default: '', trim: true },
    notes: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

export const CaregiverVetting = mongoose.model(
  'CaregiverVetting',
  caregiverVettingSchema
);
export { PROBATION_STATUSES, VETTING_STATUSES };
