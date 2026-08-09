import mongoose from 'mongoose';

export const SESSION_STATUSES = [
  'requested',
  'accepted',
  'declined',
  'active',
  'ended',
  'timeout',
];

const medicalSessionSchema = new mongoose.Schema(
  {
    elderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Elder',
      required: true,
      index: true,
    },
    caregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    status: {
      type: String,
      enum: SESSION_STATUSES,
      default: 'requested',
      index: true,
    },
    roomId: { type: String, default: '' },
    requestedAt: { type: Date, default: Date.now },
    respondBy: { type: Date },
    respondedAt: { type: Date },
    startedAt: { type: Date },
    endedAt: { type: Date },
    durationMinutes: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    diagnosis: { type: String, default: '' },
    followUp: { type: String, default: '' },
    notesLockedAt: { type: Date },
  },
  { timestamps: true }
);

export const MedicalSession = mongoose.model(
  'MedicalSession',
  medicalSessionSchema
);
