import { Prescription } from '../models/Prescription.js';
import { CarePlan } from '../models/CarePlan.js';
import { MedicalDocument } from '../models/MedicalDocument.js';

function prescriptionDto(doc) {
  return {
    id: doc._id.toString(),
    elderId: doc.elderId?._id
      ? doc.elderId._id.toString()
      : doc.elderId.toString(),
    elder: doc.elderId?.name
      ? { id: doc.elderId._id.toString(), name: doc.elderId.name }
      : undefined,
    caregiverId: doc.caregiverId?._id
      ? doc.caregiverId._id.toString()
      : doc.caregiverId.toString(),
    caregiver: doc.caregiverId?.name
      ? { id: doc.caregiverId._id.toString(), name: doc.caregiverId.name }
      : undefined,
    imageUrl: doc.imageUrl,
    caption: doc.caption,
    medicineName: doc.medicineName,
    dosage: doc.dosage,
    frequency: doc.frequency,
    duration: doc.duration,
    locked: doc.locked,
    createdAt: doc.createdAt,
  };
}

export async function uploadPrescription(req, res, next) {
  try {
    const { elderId, imageUrl, caption } = req.body;
    if (!elderId || !imageUrl) {
      return res.status(400).json({
        message: 'Elder and image URL are required',
      });
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

    // Mock imgbb: accept any URL or data URL string from the client.
    const prescription = await Prescription.create({
      elderId,
      caregiverId: req.auth.userId,
      imageUrl: String(imageUrl).trim(),
      caption: String(caption || '').trim(),
    });

    await MedicalDocument.create({
      elderId,
      familyMemberId: plan.familyMemberId,
      type: 'prescription',
      title: caption || 'Caregiver prescription upload',
      url: prescription.imageUrl,
      notes: `Uploaded by caregiver ${req.auth.userId}`,
    });

    const populated = await Prescription.findById(prescription._id)
      .populate('elderId', 'name')
      .populate('caregiverId', 'name');

    res.status(201).json({
      message: 'Prescription uploaded',
      prescription: prescriptionDto(populated),
    });
  } catch (err) {
    next(err);
  }
}

export async function listCaregiverPrescriptions(req, res, next) {
  try {
    const filter = { caregiverId: req.auth.userId };
    if (req.query.elderId) filter.elderId = req.query.elderId;
    const docs = await Prescription.find(filter)
      .populate('elderId', 'name')
      .populate('caregiverId', 'name')
      .sort({ createdAt: -1 });
    res.json({ prescriptions: docs.map(prescriptionDto) });
  } catch (err) {
    next(err);
  }
}

export async function listFamilyPrescriptions(req, res, next) {
  try {
    const { Elder } = await import('../models/Elder.js');
    const elders = await Elder.find({ familyMemberId: req.auth.userId }).select(
      '_id'
    );
    const filter = { elderId: { $in: elders.map((e) => e._id) } };
    if (req.query.elderId) filter.elderId = req.query.elderId;
    const docs = await Prescription.find(filter)
      .populate('elderId', 'name')
      .populate('caregiverId', 'name')
      .sort({ createdAt: -1 });
    res.json({ prescriptions: docs.map(prescriptionDto) });
  } catch (err) {
    next(err);
  }
}

export async function listDoctorPrescriptions(req, res, next) {
  try {
    const filter = {};
    if (req.query.elderId) filter.elderId = req.query.elderId;
    const docs = await Prescription.find(filter)
      .populate('elderId', 'name')
      .populate('caregiverId', 'name')
      .populate('issuedByDoctorId', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ prescriptions: docs.map(prescriptionDto) });
  } catch (err) {
    next(err);
  }
}
