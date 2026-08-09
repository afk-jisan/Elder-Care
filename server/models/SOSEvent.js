import mongoose from 'mongoose';

export const SOS_STATUSES = ['active', 'family_notified', 'escalated', 'resolved'];

const sosEventSchema = new mongoose.Schema(
  {
    elderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Elder',
      required: true,
    },
    caregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    familyMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    triggerSource: { type: String, default: 'caregiver_dashboard' },
    status: { type: String, enum: SOS_STATUSES, default: 'active' },
    latitude: { type: Number },
    longitude: { type: Number },
    notifiedFamilyAt: { type: Date },
    escalatedAt: { type: Date },
    resolvedAt: { type: Date },
    resolutionNote: { type: String, default: '' },
    timeline: [
      {
        at: { type: Date, default: Date.now },
        event: String,
        detail: String,
      },
    ],
  },
  { timestamps: true }
);

export const SOSEvent = mongoose.model('SOSEvent', sosEventSchema);
