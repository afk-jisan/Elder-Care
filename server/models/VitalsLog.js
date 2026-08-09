import mongoose from 'mongoose';

const DECLINE_KEYWORDS = [
  'forget',
  'confused',
  'confusion',
  'fall',
  'fell',
  'decline',
  'agitat',
  'withdrawn',
  'depressed',
  'disoriented',
  'wander',
];

export function flagIfDeclineDetected(notes = '') {
  const text = String(notes).toLowerCase();
  return DECLINE_KEYWORDS.some((kw) => text.includes(kw));
}

const vitalsLogSchema = new mongoose.Schema(
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
      index: true,
    },
    carePlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CarePlan',
      required: true,
    },
    visitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visit',
      default: null,
    },
    bloodPressure: { type: String, required: true, trim: true },
    bloodSugar: { type: Number, required: true },
    weight: { type: Number, required: true },
    temperature: { type: Number },
    behavioralNotes: { type: String, default: '', trim: true },
    flagged: { type: Boolean, default: false, index: true },
    recordedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const VitalsLog = mongoose.model('VitalsLog', vitalsLogSchema);
export { DECLINE_KEYWORDS };
