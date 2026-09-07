import mongoose from 'mongoose';

export const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const doctorAvailabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dayOfWeek: { type: String, enum: DAYS, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { timestamps: true }
);

doctorAvailabilitySchema.index(
  { doctorId: 1, dayOfWeek: 1, startTime: 1, endTime: 1 },
  { unique: true }
);

export const DoctorAvailability = mongoose.model(
  'DoctorAvailability',
  doctorAvailabilitySchema
);
