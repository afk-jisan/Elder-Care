import mongoose from 'mongoose';

export const TASK_TYPES = [
  'companion_visit',
  'medication_support',
  'vitals_check',
  'errand',
  'hygiene_support',
  'other',
];

export const TASK_STATUSES = [
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
];

export const COMPLETION_METHODS = ['photo', 'note', 'checklist'];

const taskSchema = new mongoose.Schema(
  {
    carePlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CarePlan',
      required: true,
      index: true,
    },
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
    familyMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: TASK_TYPES,
      required: true,
    },
    title: { type: String, required: true, trim: true },
    scheduledTime: { type: Date, required: true, index: true },
    completionMethod: {
      type: String,
      enum: COMPLETION_METHODS,
      default: 'note',
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: 'scheduled',
      index: true,
    },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    photoUrl: { type: String, default: '', trim: true },
    completionNote: { type: String, default: '', trim: true },
    completedAt: { type: Date },
    visitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visit',
      default: null,
    },
  },
  { timestamps: true }
);

export const Task = mongoose.model('Task', taskSchema);
