import {
  DoctorAvailability,
  DAYS,
} from '../models/DoctorAvailability.js';

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

function slotDto(slot) {
  return {
    id: slot._id.toString(),
    doctorId: slot.doctorId.toString(),
    dayOfWeek: slot.dayOfWeek,
    startTime: slot.startTime,
    endTime: slot.endTime,
    createdAt: slot.createdAt,
  };
}

function isValidRange(startTime, endTime) {
  return TIME_RE.test(startTime) && TIME_RE.test(endTime) && startTime < endTime;
}

export async function listAvailability(req, res, next) {
  try {
    const slots = await DoctorAvailability.find({
      doctorId: req.auth.userId,
    }).sort({ dayOfWeek: 1, startTime: 1 });
    res.json({ availability: slots.map(slotDto), days: DAYS });
  } catch (err) {
    next(err);
  }
}

export async function createAvailability(req, res, next) {
  try {
    const { dayOfWeek, startTime, endTime } = req.body;
    if (!dayOfWeek || !startTime || !endTime) {
      return res
        .status(400)
        .json({ message: 'Day, start time, and end time are required' });
    }
    if (!DAYS.includes(dayOfWeek)) {
      return res.status(400).json({ message: 'Invalid day of week' });
    }
    if (!isValidRange(startTime, endTime)) {
      return res.status(400).json({
        message: 'Times must be HH:MM and start must be before end',
      });
    }

    const slot = await DoctorAvailability.create({
      doctorId: req.auth.userId,
      dayOfWeek,
      startTime,
      endTime,
    });

    res.status(201).json({
      message: 'Availability added',
      availability: slotDto(slot),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: 'This availability slot already exists' });
    }
    next(err);
  }
}

export async function deleteAvailability(req, res, next) {
  try {
    const slot = await DoctorAvailability.findOneAndDelete({
      _id: req.params.id,
      doctorId: req.auth.userId,
    });
    if (!slot) {
      return res.status(404).json({ message: 'Availability not found' });
    }
    res.json({ message: 'Availability removed' });
  } catch (err) {
    next(err);
  }
}
