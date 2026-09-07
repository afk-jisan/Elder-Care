import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
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
    imageUrl: { type: String, required: true, trim: true },
    caption: { type: String, default: '', trim: true },
    medicineName: { type: String, default: '', trim: true },
    dosage: { type: String, default: '', trim: true },
    frequency: { type: String, default: '', trim: true },
    duration: { type: String, default: '', trim: true },
    issuedByDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    locked: { type: Boolean, default: false },
    lockedAt: { type: Date },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalSession',
      default: null,
    },
  },
  { timestamps: true }
);

export const Prescription = mongoose.model('Prescription', prescriptionSchema);
