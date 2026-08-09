import mongoose from 'mongoose';

export const DOCUMENT_TYPES = [
  'nid',
  'blood_type',
  'allergy_list',
  'ecg',
  'prescription',
  'other',
];

const medicalDocumentSchema = new mongoose.Schema(
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
    type: { type: String, enum: DOCUMENT_TYPES, required: true },
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    notes: { type: String, default: '', trim: true },
    shareToken: { type: String, default: null, index: true },
    shareExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const MedicalDocument = mongoose.model(
  'MedicalDocument',
  medicalDocumentSchema
);
