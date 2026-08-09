import { Dispute, DISPUTE_RULINGS } from '../models/Dispute.js';
import { SOSEvent } from '../models/SOSEvent.js';
import { Payment } from '../models/Payment.js';
import { CarePlan } from '../models/CarePlan.js';
import { User } from '../models/User.js';
import { Elder } from '../models/Elder.js';
import { Task } from '../models/Task.js';
import { MedicalSession } from '../models/MedicalSession.js';
import { Visit } from '../models/Visit.js';

export async function listDisputes(req, res, next) {
  try {
    const disputes = await Dispute.find()
      .populate('familyMemberId', 'name email')
      .populate('caregiverId', 'name email')
      .sort({ createdAt: -1 });
    res.json({
      disputes: disputes.map((d) => ({
        id: d._id.toString(),
        status: d.status,
        evidence: d.evidence,
        ruling: d.ruling,
        reason: d.reason,
        paymentId: d.paymentId.toString(),
        family: d.familyMemberId?.name,
        caregiver: d.caregiverId?.name,
        createdAt: d.createdAt,
        resolvedAt: d.resolvedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function createDispute(req, res, next) {
  try {
    const { paymentId, evidence } = req.body;
    const payment = await Payment.findOne({
      _id: paymentId,
      familyMemberId: req.auth.userId,
      status: 'completed',
    });
    if (!payment || !payment.caregiverId) {
      return res.status(404).json({
        message: 'Completed caregiver payment not found',
      });
    }
    const dispute = await Dispute.create({
      familyMemberId: req.auth.userId,
      caregiverId: payment.caregiverId,
      paymentId: payment._id,
      taskId: payment.taskId,
      evidence: String(evidence || '').trim(),
      status: 'open',
    });
    payment.status = 'held';
    await payment.save();
    res.status(201).json({
      message: 'Dispute opened; funds held',
      disputeId: dispute._id.toString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function resolveDispute(req, res, next) {
  try {
    const { ruling, reason } = req.body;
    if (!DISPUTE_RULINGS.includes(ruling)) {
      return res.status(400).json({ message: 'Invalid ruling' });
    }
    if (!reason) {
      return res.status(400).json({ message: 'Reason is required' });
    }
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute || dispute.status !== 'open') {
      return res.status(404).json({ message: 'Open dispute not found' });
    }
    dispute.status = 'resolved';
    dispute.ruling = ruling;
    dispute.reason = String(reason).trim();
    dispute.resolvedBy = req.auth.userId;
    dispute.resolvedAt = new Date();
    await dispute.save();

    const payment = await Payment.findById(dispute.paymentId);
    if (payment) {
      payment.status = 'completed';
      payment.note = `Dispute ruling: ${ruling}. ${dispute.reason}`;
      await payment.save();
    }

    res.json({
      message: 'Dispute resolved (mock notification to both parties)',
      disputeId: dispute._id.toString(),
      ruling,
    });
  } catch (err) {
    next(err);
  }
}

export async function triggerSos(req, res, next) {
  try {
    const { elderId, latitude, longitude } = req.body;
    if (!elderId) {
      return res.status(400).json({ message: 'elderId is required' });
    }
    const plan = await CarePlan.findOne({
      caregiverId: req.auth.userId,
      elderId,
      status: 'active',
    });
    if (!plan) {
      return res.status(400).json({ message: 'No active assignment for this elder' });
    }

    const event = await SOSEvent.create({
      elderId,
      caregiverId: req.auth.userId,
      familyMemberId: plan.familyMemberId,
      latitude,
      longitude,
      status: 'family_notified',
      notifiedFamilyAt: new Date(),
      timeline: [
        { event: 'triggered', detail: 'Caregiver triggered SOS' },
        {
          event: 'family_notified',
          detail: 'Mock SMS/call sent to family with GPS',
        },
      ],
    });

    // Escalate if unresolved after 15 minutes: mark flag for admin poll;
    // tests can force escalate via admin endpoint.
    res.status(201).json({
      message: 'SOS triggered; family notified (mock)',
      sosEvent: {
        id: event._id.toString(),
        status: event.status,
        escalateAfterMs: 15 * 60 * 1000,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listSos(req, res, next) {
  try {
    const events = await SOSEvent.find()
      .populate('elderId', 'name')
      .populate('caregiverId', 'name')
      .populate('familyMemberId', 'name')
      .sort({ createdAt: -1 });
    res.json({
      events: events.map((e) => ({
        id: e._id.toString(),
        status: e.status,
        elder: e.elderId?.name,
        caregiver: e.caregiverId?.name,
        family: e.familyMemberId?.name,
        latitude: e.latitude,
        longitude: e.longitude,
        timeline: e.timeline,
        resolutionNote: e.resolutionNote,
        createdAt: e.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function escalateSos(req, res, next) {
  try {
    const event = await SOSEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'SOS not found' });
    if (['resolved'].includes(event.status)) {
      return res.status(400).json({ message: 'SOS already resolved' });
    }
    event.status = 'escalated';
    event.escalatedAt = new Date();
    event.timeline.push({
      event: 'escalated',
      detail: 'Escalated to admin after no family confirmation',
    });
    await event.save();
    res.json({ message: 'SOS escalated to admin', status: event.status });
  } catch (err) {
    next(err);
  }
}

export async function resolveSos(req, res, next) {
  try {
    const event = await SOSEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'SOS not found' });
    event.status = 'resolved';
    event.resolvedAt = new Date();
    event.resolutionNote = String(req.body.resolutionNote || '').trim();
    event.timeline.push({
      event: 'resolved',
      detail: event.resolutionNote || 'Resolved by admin',
    });
    await event.save();
    res.json({ message: 'SOS resolved', status: event.status });
  } catch (err) {
    next(err);
  }
}

export async function getAnalytics(req, res, next) {
  try {
    const [
      elders,
      caregivers,
      doctors,
      families,
      tasks,
      sessions,
      payments,
    ] = await Promise.all([
      Elder.countDocuments(),
      User.countDocuments({ role: 'caregiver', isActive: true }),
      User.countDocuments({ role: 'doctor', isActive: true }),
      User.countDocuments({ role: 'family', isActive: true }),
      Task.find().select('status'),
      MedicalSession.find().select('status durationMinutes'),
      Payment.find({ status: 'completed' }).select('amount'),
    ]);

    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const cancelledTasks = tasks.filter((t) => t.status === 'cancelled').length;
    const escrowVolume = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const endedSessions = sessions.filter((s) => s.status === 'ended');
    const avgDuration =
      endedSessions.length === 0
        ? 0
        : endedSessions.reduce((s, x) => s + (x.durationMinutes || 0), 0) /
          endedSessions.length;

    const report = {
      activeElders: elders,
      activeCaregivers: caregivers,
      activeDoctors: doctors,
      activeFamilies: families,
      tasksCompleted: completedTasks,
      tasksCancelled: cancelledTasks,
      tasksTotal: tasks.length,
      escrowVolume,
      averagePayment:
        payments.length === 0 ? 0 : Number((escrowVolume / payments.length).toFixed(2)),
      videoSessionCount: endedSessions.length,
      averageSessionMinutes: Number(avgDuration.toFixed(1)),
      generatedAt: new Date(),
    };

    if (req.query.format === 'csv') {
      const rows = Object.entries(report)
        .map(([k, v]) => `${k},${v}`)
        .join('\n');
      res.type('text/csv').send(`metric,value\n${rows}\n`);
      return;
    }

    res.json({ report });
  } catch (err) {
    next(err);
  }
}
