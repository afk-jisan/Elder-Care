import { MedicalSession } from '../models/MedicalSession.js';
import { DoctorAvailability } from '../models/DoctorAvailability.js';
import { CarePlan } from '../models/CarePlan.js';
import { User } from '../models/User.js';
import { Prescription } from '../models/Prescription.js';
import { Rating } from '../models/Rating.js';

const ACCEPT_WINDOW_MS = 60 * 1000;

function sessionDto(s) {
  return {
    id: s._id.toString(),
    elderId: s.elderId?._id ? s.elderId._id.toString() : s.elderId.toString(),
    elder: s.elderId?.name
      ? { id: s.elderId._id.toString(), name: s.elderId.name }
      : undefined,
    caregiverId: s.caregiverId?._id
      ? s.caregiverId._id.toString()
      : s.caregiverId.toString(),
    caregiver: s.caregiverId?.name
      ? { id: s.caregiverId._id.toString(), name: s.caregiverId.name }
      : undefined,
    doctorId: s.doctorId?._id ? s.doctorId._id.toString() : s.doctorId.toString(),
    doctor: s.doctorId?.name
      ? { id: s.doctorId._id.toString(), name: s.doctorId.name }
      : undefined,
    status: s.status,
    roomId: s.roomId,
    requestedAt: s.requestedAt,
    respondBy: s.respondBy,
    respondedAt: s.respondedAt,
    startedAt: s.startedAt,
    endedAt: s.endedAt,
    durationMinutes: s.durationMinutes,
    notes: s.notes,
    diagnosis: s.diagnosis,
    followUp: s.followUp,
    notesLockedAt: s.notesLockedAt,
  };
}

function dayName(date = new Date()) {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function isDoctorAvailableNow(slots, now = new Date()) {
  const day = dayName(now);
  const minutes = now.getHours() * 60 + now.getMinutes();
  return slots.some((slot) => {
    if (slot.dayOfWeek !== day) return false;
    const [sh, sm] = String(slot.startTime).split(':').map(Number);
    const [eh, em] = String(slot.endTime).split(':').map(Number);
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    return minutes >= start && minutes <= end;
  });
}

async function expireTimedOut(session) {
  if (
    session.status === 'requested' &&
    session.respondBy &&
    session.respondBy.getTime() < Date.now()
  ) {
    session.status = 'timeout';
    await session.save();
  }
  return session;
}

export async function listAvailableDoctors(req, res, next) {
  try {
    const doctors = await User.find({ role: 'doctor', isActive: true });
    const now = new Date();
    const available = [];
    for (const doc of doctors) {
      const slots = await DoctorAvailability.find({ doctorId: doc._id });
      if (isDoctorAvailableNow(slots, now)) {
        available.push({
          id: doc._id.toString(),
          name: doc.name,
          email: doc.email,
        });
      }
    }
    res.json({ doctors: available });
  } catch (err) {
    next(err);
  }
}

export async function initiateSession(req, res, next) {
  try {
    const { elderId, doctorId } = req.body;
    if (!elderId || !doctorId) {
      return res.status(400).json({ message: 'Elder and doctor are required' });
    }

    const plan = await CarePlan.findOne({
      caregiverId: req.auth.userId,
      elderId,
      status: 'active',
    });
    if (!plan) {
      return res.status(400).json({ message: 'No active assignment for this elder' });
    }

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor', isActive: true });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const slots = await DoctorAvailability.find({ doctorId });
    if (!isDoctorAvailableNow(slots)) {
      return res.status(400).json({
        message: 'No doctors available in the selected availability window',
      });
    }

    const requestedAt = new Date();
    const session = await MedicalSession.create({
      elderId,
      caregiverId: req.auth.userId,
      doctorId,
      familyMemberId: plan.familyMemberId,
      status: 'requested',
      requestedAt,
      respondBy: new Date(requestedAt.getTime() + ACCEPT_WINDOW_MS),
      roomId: `mock-100ms-${Date.now()}`,
    });

    const populated = await MedicalSession.findById(session._id)
      .populate('elderId', 'name')
      .populate('caregiverId', 'name')
      .populate('doctorId', 'name');

    res.status(201).json({
      message: 'Session requested. Doctor has 60 seconds to respond (mock push).',
      session: sessionDto(populated),
    });
  } catch (err) {
    next(err);
  }
}

export async function listCaregiverSessions(req, res, next) {
  try {
    const sessions = await MedicalSession.find({ caregiverId: req.auth.userId })
      .populate('elderId', 'name')
      .populate('doctorId', 'name')
      .sort({ createdAt: -1 });
    for (const s of sessions) await expireTimedOut(s);
    res.json({ sessions: sessions.map(sessionDto) });
  } catch (err) {
    next(err);
  }
}

export async function listDoctorSessions(req, res, next) {
  try {
    const sessions = await MedicalSession.find({ doctorId: req.auth.userId })
      .populate('elderId', 'name')
      .populate('caregiverId', 'name')
      .sort({ createdAt: -1 });
    for (const s of sessions) await expireTimedOut(s);
    res.json({ sessions: sessions.map(sessionDto) });
  } catch (err) {
    next(err);
  }
}

export async function listFamilySessions(req, res, next) {
  try {
    const sessions = await MedicalSession.find({
      familyMemberId: req.auth.userId,
    })
      .populate('elderId', 'name')
      .populate('doctorId', 'name')
      .populate('caregiverId', 'name')
      .sort({ createdAt: -1 });
    for (const s of sessions) await expireTimedOut(s);
    const ratings = await Rating.find({
      sessionId: { $in: sessions.map((s) => s._id) },
    });
    const rated = new Set(ratings.map((r) => r.sessionId.toString()));
    res.json({
      sessions: sessions.map((s) => ({
        ...sessionDto(s),
        rated: rated.has(s._id.toString()),
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function respondToSession(req, res, next) {
  try {
    const { decision } = req.body;
    if (!['accept', 'decline'].includes(decision)) {
      return res.status(400).json({ message: 'decision must be accept or decline' });
    }

    let session = await MedicalSession.findOne({
      _id: req.params.id,
      doctorId: req.auth.userId,
    });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    session = await expireTimedOut(session);
    if (session.status === 'timeout') {
      return res.status(400).json({ message: 'Request timed out after 60 seconds' });
    }
    if (session.status !== 'requested') {
      return res.status(400).json({ message: 'Session is not awaiting a response' });
    }

    session.respondedAt = new Date();
    if (decision === 'decline') {
      session.status = 'declined';
    } else {
      session.status = 'active';
      session.startedAt = new Date();
    }
    await session.save();

    const populated = await MedicalSession.findById(session._id)
      .populate('elderId', 'name')
      .populate('caregiverId', 'name')
      .populate('doctorId', 'name');

    res.json({
      message: decision === 'accept' ? 'Joined mock 100ms room' : 'Session declined',
      session: sessionDto(populated),
    });
  } catch (err) {
    next(err);
  }
}

export async function endSession(req, res, next) {
  try {
    const session = await MedicalSession.findOne({
      _id: req.params.id,
      $or: [{ doctorId: req.auth.userId }, { caregiverId: req.auth.userId }],
    });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    if (session.status !== 'active') {
      return res.status(400).json({ message: 'Only active sessions can end' });
    }
    session.status = 'ended';
    session.endedAt = new Date();
    const start = session.startedAt || session.respondedAt || session.requestedAt;
    session.durationMinutes = Math.max(
      1,
      Math.round((session.endedAt - start) / 60000)
    );
    await session.save();

    const populated = await MedicalSession.findById(session._id)
      .populate('elderId', 'name')
      .populate('caregiverId', 'name')
      .populate('doctorId', 'name');
    res.json({ message: 'Session ended', session: sessionDto(populated) });
  } catch (err) {
    next(err);
  }
}

export async function writeSessionNotes(req, res, next) {
  try {
    const session = await MedicalSession.findOne({
      _id: req.params.id,
      doctorId: req.auth.userId,
      status: 'ended',
    });
    if (!session) {
      return res.status(404).json({ message: 'Ended session not found' });
    }
    if (session.notesLockedAt && session.notesLockedAt.getTime() <= Date.now()) {
      return res.status(400).json({ message: 'Notes are locked after 24 hours' });
    }

    const { notes, diagnosis, followUp, prescription } = req.body;
    session.notes = String(notes || '').trim();
    session.diagnosis = String(diagnosis || '').trim();
    session.followUp = String(followUp || '').trim();
    if (!session.notesLockedAt) {
      session.notesLockedAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    await session.save();

    let rx = null;
    if (prescription?.medicineName) {
      rx = await Prescription.create({
        elderId: session.elderId,
        caregiverId: session.caregiverId,
        issuedByDoctorId: req.auth.userId,
        sessionId: session._id,
        imageUrl: prescription.imageUrl || 'https://example.local/digital-rx.txt',
        medicineName: prescription.medicineName,
        dosage: prescription.dosage || '',
        frequency: prescription.frequency || '',
        duration: prescription.duration || '',
        caption: 'Doctor digital prescription',
        locked: false,
        lockedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    }

    res.json({
      message: 'Session notes saved',
      session: sessionDto(session),
      prescriptionId: rx?._id?.toString() || null,
    });
  } catch (err) {
    next(err);
  }
}

export async function rateDoctor(req, res, next) {
  try {
    const { score, review } = req.body;
    const value = Number(score);
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return res.status(400).json({ message: 'score must be 1-5' });
    }
    if (review && String(review).length > 300) {
      return res.status(400).json({ message: 'review max 300 characters' });
    }

    const session = await MedicalSession.findOne({
      _id: req.params.id,
      familyMemberId: req.auth.userId,
      status: 'ended',
    });
    if (!session) {
      return res.status(404).json({ message: 'Ended session not found' });
    }

    const existing = await Rating.findOne({ sessionId: session._id });
    if (existing) {
      return res.status(400).json({ message: 'Session already rated' });
    }

    const rating = await Rating.create({
      sessionId: session._id,
      doctorId: session.doctorId,
      familyMemberId: req.auth.userId,
      score: value,
      review: String(review || '').trim(),
    });

    res.status(201).json({
      message: 'Rating submitted',
      rating: {
        id: rating._id.toString(),
        score: rating.score,
        review: rating.review,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function doctorAverageRating(req, res, next) {
  try {
    const ratings = await Rating.find({ doctorId: req.auth.userId });
    const avg =
      ratings.length === 0
        ? 0
        : ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
    res.json({ average: Number(avg.toFixed(2)), count: ratings.length });
  } catch (err) {
    next(err);
  }
}
