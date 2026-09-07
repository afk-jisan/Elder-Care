import { Elder } from '../models/Elder.js';
import { Visit } from '../models/Visit.js';
import { Task } from '../models/Task.js';
import { VitalsLog } from '../models/VitalsLog.js';
import { MedicalSession } from '../models/MedicalSession.js';
import { CarePlan } from '../models/CarePlan.js';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getCareStatusFeed(req, res, next) {
  try {
    const elders = await Elder.find({ familyMemberId: req.auth.userId }).sort({
      name: 1,
    });
    const elderIds = elders.map((e) => e._id);
    const today = startOfToday();

    const [visits, tasks, vitals, plans, sessions] = await Promise.all([
      Visit.find({
        elderId: { $in: elderIds },
        $or: [
          { checkInAt: { $gte: today } },
          { checkOutAt: { $gte: today } },
          { status: 'checked_in' },
        ],
      })
        .populate('caregiverId', 'name')
        .populate('elderId', 'name')
        .sort({ checkInAt: -1 }),
      Task.find({
        familyMemberId: req.auth.userId,
        scheduledTime: { $gte: today },
      })
        .populate('elderId', 'name')
        .populate('caregiverId', 'name')
        .sort({ scheduledTime: 1 }),
      VitalsLog.find({
        elderId: { $in: elderIds },
        recordedAt: { $gte: today },
      })
        .populate('elderId', 'name')
        .populate('caregiverId', 'name')
        .sort({ recordedAt: -1 }),
      CarePlan.find({
        familyMemberId: req.auth.userId,
        status: 'active',
      }).populate('caregiverId', 'name'),
      MedicalSession.find({
        familyMemberId: req.auth.userId,
      })
        .populate('doctorId', 'name')
        .populate('elderId', 'name')
        .sort({ createdAt: -1 })
        .limit(20),
    ]);

    const flags = vitals
      .filter((v) => v.flagged)
      .map((v) => ({
        type: 'vitals_flag',
        at: v.recordedAt,
        elderId: v.elderId._id.toString(),
        elderName: v.elderId.name,
        message: v.behavioralNotes || 'Behavioral note flagged',
        caregiverName: v.caregiverId?.name,
      }));

    const feed = {
      elders: elders.map((e) => ({
        id: e._id.toString(),
        name: e.name,
        address: e.address,
      })),
      activePlans: plans.map((p) => ({
        id: p._id.toString(),
        elderId: p.elderId.toString(),
        package: p.package,
        caregiverName: p.caregiverId?.name || null,
      })),
      alerts: flags,
      checkIns: visits.map((v) => ({
        id: v._id.toString(),
        elderId: v.elderId?._id?.toString() || v.elderId.toString(),
        elderName: v.elderId?.name,
        caregiverName: v.caregiverId?.name,
        status: v.status,
        checkInAt: v.checkInAt,
        checkOutAt: v.checkOutAt,
      })),
      vitals: vitals.map((v) => ({
        id: v._id.toString(),
        elderId: v.elderId._id.toString(),
        elderName: v.elderId.name,
        caregiverName: v.caregiverId?.name,
        bloodPressure: v.bloodPressure,
        bloodSugar: v.bloodSugar,
        weight: v.weight,
        temperature: v.temperature,
        behavioralNotes: v.behavioralNotes,
        flagged: v.flagged,
        recordedAt: v.recordedAt,
      })),
      tasks: tasks.map((t) => ({
        id: t._id.toString(),
        title: t.title,
        type: t.type,
        status: t.status,
        scheduledTime: t.scheduledTime,
        elderName: t.elderId?.name,
        caregiverName: t.caregiverId?.name,
        completedAt: t.completedAt,
      })),
      medicalSessions: sessions.map((s) => ({
        id: s._id.toString(),
        status: s.status,
        doctorName: s.doctorId?.name,
        elderName: s.elderId?.name,
        durationMinutes: s.durationMinutes,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
      })),
    };

    res.json({ feed, generatedAt: new Date() });
  } catch (err) {
    next(err);
  }
}
