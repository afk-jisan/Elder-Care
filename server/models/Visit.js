import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema(
  {
    caregiverId: {
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
    carePlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CarePlan',
      required: true,
    },
    status: {
      type: String,
      enum: ['checked_in', 'checked_out'],
      default: 'checked_in',
    },
    checkInAt: { type: Date, required: true },
    checkInLatitude: { type: Number, required: true },
    checkInLongitude: { type: Number, required: true },
    checkInDistanceMeters: { type: Number, required: true },
    checkOutAt: { type: Date },
    checkOutLatitude: { type: Number },
    checkOutLongitude: { type: Number },
    checkOutDistanceMeters: { type: Number },
    checkOutPhotoUrl: { type: String },
  },
  { timestamps: true }
);

export const Visit = mongoose.model('Visit', visitSchema);
