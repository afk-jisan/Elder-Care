import {
  VitalsLog,
  flagIfDeclineDetected,
} from '../models/VitalsLog.js';
import { CarePlan } from '../models/CarePlan.js';
import { Visit } from '../models/Visit.js';

function vitalsDto(log) {
  return {
    id: log._id.toString(),
    elderId: log.elderId?._id
      ? log.elderId._id.toString()
      : log.elderId.toString(),
    elder: log.elderId?.name
      ? {
          id: log.elderId._id.toString(),
          name: log.elderId.name,
          address: log.elderId.address,
        }
      : undefined,
    caregiverId: log.caregiverId?._id
      ? log.caregiverId._id.toString()
      : log.caregiverId.toString(),
    caregiver: log.caregiverId?.name
      ? {
          id: log.caregiverId._id.toString(),
          name: log.caregiverId.name,
        }
      : undefined,
    carePlanId: log.carePlanId.toString(),
    visitId: log.visitId ? log.visitId.toString() : null,
    bloodPressure: log.bloodPressure,
    bloodSugar: log.bloodSugar,
    weight: log.weight,
    temperature: log.temperature,
    behavioralNotes: log.behavioralNotes,
    flagged: log.flagged,
    recordedAt: log.recordedAt,
    createdAt: log.createdAt,
  };
}

export async function createVitalsLog(req, res, next) {
  try {
    const {
      elderId,
      bloodPressure,
      bloodSugar,
      weight,
      temperature,
      behavioralNotes,
    } = req.body;

    if (!elderId || !bloodPressure || bloodSugar === undefined || weight === undefined) {
      return res.status(400).json({
        message: 'Elder, blood pressure, blood sugar, and weight are required',
      });
    }

    const sugar = Number(bloodSugar);
    const wt = Number(weight);
    if (Number.isNaN(sugar) || Number.isNaN(wt)) {
      return res.status(400).json({ message: 'Blood sugar and weight must be numbers' });
    }

    let temp;
    if (temperature !== undefined && temperature !== '' && temperature !== null) {
      temp = Number(temperature);
      if (Number.isNaN(temp)) {
        return res.status(400).json({ message: 'Temperature must be a number' });
      }
    }

    const plan = await CarePlan.findOne({
      caregiverId: req.auth.userId,
      elderId,
      status: 'active',
    });
    if (!plan) {
      return res.status(400).json({
        message: 'No active assignment for this elder',
      });
    }

    const activeVisit = await Visit.findOne({
      caregiverId: req.auth.userId,
      elderId,
      status: 'checked_in',
    });

    const notes = String(behavioralNotes || '').trim();
    const flagged = flagIfDeclineDetected(notes);

    const log = await VitalsLog.create({
      elderId,
      caregiverId: req.auth.userId,
      carePlanId: plan._id,
      visitId: activeVisit ? activeVisit._id : null,
      bloodPressure: String(bloodPressure).trim(),
      bloodSugar: sugar,
      weight: wt,
      temperature: temp,
      behavioralNotes: notes,
      flagged,
      recordedAt: new Date(),
    });

    const populated = await VitalsLog.findById(log._id)
      .populate('elderId', 'name address')
      .populate('caregiverId', 'name');

    res.status(201).json({
      message: flagged
        ? 'Vitals saved and flagged for family review'
        : 'Vitals saved',
      vitalsLog: vitalsDto(populated),
    });
  } catch (err) {
    next(err);
  }
}

export async function listCaregiverVitals(req, res, next) {
  try {
    const filter = { caregiverId: req.auth.userId };
    if (req.query.elderId) filter.elderId = req.query.elderId;

    const logs = await VitalsLog.find(filter)
      .populate('elderId', 'name address')
      .populate('caregiverId', 'name')
      .sort({ recordedAt: -1 })
      .limit(100);

    res.json({ vitalsLogs: logs.map(vitalsDto) });
  } catch (err) {
    next(err);
  }
}

export async function listFamilyVitals(req, res, next) {
  try {
    const { Elder } = await import('../models/Elder.js');
    const elders = await Elder.find({ familyMemberId: req.auth.userId }).select(
      '_id'
    );
    const elderIds = elders.map((e) => e._id);

    const filter = { elderId: { $in: elderIds } };
    if (req.query.elderId) filter.elderId = req.query.elderId;
    if (req.query.flagged === 'true') filter.flagged = true;

    const logs = await VitalsLog.find(filter)
      .populate('elderId', 'name address')
      .populate('caregiverId', 'name')
      .sort({ recordedAt: -1 })
      .limit(100);

    res.json({ vitalsLogs: logs.map(vitalsDto) });
  } catch (err) {
    next(err);
  }
}
