import { CaregiverVetting, PROBATION_STATUSES } from '../models/CaregiverVetting.js';
import { User } from '../models/User.js';
import { validateNid } from '../utils/userValidation.js';

function vettingDto(doc) {
  const caregiver = doc.caregiverId?.name
    ? {
        id: doc.caregiverId._id.toString(),
        name: doc.caregiverId.name,
        email: doc.caregiverId.email,
        phone: doc.caregiverId.phone,
        verificationStatus: doc.caregiverId.verificationStatus,
        isActive: doc.caregiverId.isActive,
      }
    : undefined;

  return {
    id: doc._id.toString(),
    caregiverId: doc.caregiverId?._id
      ? doc.caregiverId._id.toString()
      : doc.caregiverId.toString(),
    caregiver,
    nidVerified: doc.nidVerified,
    nidNumber: doc.nidNumber,
    nidVerifiedAt: doc.nidVerifiedAt,
    policeClearance: doc.policeClearance,
    policeDocumentUrl: doc.policeDocumentUrl,
    policeReviewedAt: doc.policeReviewedAt,
    referenceCheck: doc.referenceCheck,
    references: doc.references || [],
    referencesReviewedAt: doc.referencesReviewedAt,
    probationStatus: doc.probationStatus,
    probationNote: doc.probationNote,
    probationReviewedAt: doc.probationReviewedAt,
    status: doc.status,
    activatedAt: doc.activatedAt,
    rejectedAt: doc.rejectedAt,
    rejectionReason: doc.rejectionReason,
    notes: doc.notes,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function loadVetting(id) {
  return CaregiverVetting.findById(id).populate(
    'caregiverId',
    'name email phone verificationStatus isActive role'
  );
}

function markInProgress(doc) {
  if (doc.status === 'pending') {
    doc.status = 'in_progress';
  }
}

export async function listVetting(req, res, next) {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const records = await CaregiverVetting.find(filter)
      .populate('caregiverId', 'name email phone verificationStatus isActive')
      .sort({ updatedAt: -1 });

    res.json({ records: records.map(vettingDto) });
  } catch (err) {
    next(err);
  }
}

export async function listUnvettedCaregivers(req, res, next) {
  try {
    const activated = await CaregiverVetting.find({
      status: 'activated',
    }).select('caregiverId');
    const activatedIds = activated.map((r) => r.caregiverId);
    const inPipeline = await CaregiverVetting.find({
      status: { $in: ['pending', 'in_progress'] },
    }).select('caregiverId');
    const pipelineIds = inPipeline.map((r) => r.caregiverId);
    const exclude = [...activatedIds, ...pipelineIds];

    const caregivers = await User.find({
      role: 'caregiver',
      isActive: true,
      _id: { $nin: exclude },
    }).sort({ name: 1 });

    res.json({
      caregivers: caregivers.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        email: c.email,
        phone: c.phone,
        verificationStatus: c.verificationStatus,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function startVetting(req, res, next) {
  try {
    const caregiverId = req.params.caregiverId || req.body.caregiverId;
    if (!caregiverId) {
      return res.status(400).json({ message: 'Caregiver is required' });
    }

    const caregiver = await User.findOne({
      _id: caregiverId,
      role: 'caregiver',
    });
    if (!caregiver) {
      return res.status(404).json({ message: 'Caregiver not found' });
    }

    const existing = await CaregiverVetting.findOne({ caregiverId });
    if (existing) {
      if (existing.status === 'rejected') {
        existing.status = 'pending';
        existing.rejectionReason = '';
        existing.rejectedAt = undefined;
        existing.nidVerified = false;
        existing.policeClearance = false;
        existing.referenceCheck = false;
        existing.references = [];
        existing.probationStatus = 'not_started';
        existing.probationNote = '';
        existing.activatedAt = undefined;
        await existing.save();
        caregiver.verificationStatus = 'pending';
        await caregiver.save();
        const populated = await loadVetting(existing._id);
        return res.json({
          message: 'Vetting restarted',
          record: vettingDto(populated),
        });
      }
      return res.status(400).json({ message: 'Vetting already exists for this caregiver' });
    }

    const record = await CaregiverVetting.create({
      caregiverId: caregiver._id,
      status: 'pending',
    });
    caregiver.verificationStatus = 'pending';
    await caregiver.save();

    const populated = await loadVetting(record._id);
    res.status(201).json({
      message: 'Vetting started',
      record: vettingDto(populated),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateNid(req, res, next) {
  try {
    const doc = await CaregiverVetting.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Vetting record not found' });
    }
    if (doc.status === 'activated' || doc.status === 'rejected') {
      return res.status(400).json({ message: 'Cannot update a closed vetting record' });
    }

    const { approved, nidNumber } = req.body;
    if (typeof approved !== 'boolean') {
      return res.status(400).json({ message: 'approved (boolean) is required' });
    }

    doc.nidVerified = approved;
    if (nidNumber !== undefined) {
      const nidError = validateNid(nidNumber);
      if (nidError) {
        return res.status(400).json({ message: nidError });
      }
      doc.nidNumber = String(nidNumber).trim();
    }
    doc.nidVerifiedAt = new Date();
    doc.nidVerifiedBy = req.auth.userId;
    markInProgress(doc);
    await doc.save();

    const populated = await loadVetting(doc._id);
    res.json({
      message: approved ? 'NID verified' : 'NID marked as not verified',
      record: vettingDto(populated),
    });
  } catch (err) {
    next(err);
  }
}

export async function updatePolice(req, res, next) {
  try {
    const doc = await CaregiverVetting.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Vetting record not found' });
    }
    if (doc.status === 'activated' || doc.status === 'rejected') {
      return res.status(400).json({ message: 'Cannot update a closed vetting record' });
    }

    const { approved, documentUrl } = req.body;
    if (typeof approved !== 'boolean') {
      return res.status(400).json({ message: 'approved (boolean) is required' });
    }

    if (documentUrl !== undefined) {
      doc.policeDocumentUrl = String(documentUrl).trim();
    }
    if (approved && !doc.policeDocumentUrl) {
      return res.status(400).json({
        message: 'Police clearance document URL is required before approval',
      });
    }

    doc.policeClearance = approved;
    doc.policeReviewedAt = new Date();
    doc.policeReviewedBy = req.auth.userId;
    markInProgress(doc);
    await doc.save();

    const populated = await loadVetting(doc._id);
    res.json({
      message: approved
        ? 'Police clearance approved'
        : 'Police clearance marked as not approved',
      record: vettingDto(populated),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateReferences(req, res, next) {
  try {
    const doc = await CaregiverVetting.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Vetting record not found' });
    }
    if (doc.status === 'activated' || doc.status === 'rejected') {
      return res.status(400).json({ message: 'Cannot update a closed vetting record' });
    }

    const { references, approved } = req.body;
    if (!Array.isArray(references) || references.length < 2) {
      return res.status(400).json({
        message: 'At least two references are required',
      });
    }

    const normalized = references.slice(0, 5).map((ref) => ({
      name: String(ref.name || '').trim(),
      relation: String(ref.relation || '').trim(),
      note: String(ref.note || '').trim(),
      verified: Boolean(ref.verified),
    }));

    if (normalized.some((r) => !r.name || !r.relation)) {
      return res.status(400).json({
        message: 'Each reference needs a name and relation',
      });
    }

    const hasInstitution = normalized.some((r) => {
      const rel = r.relation.toLowerCase();
      return (
        rel.includes('councilor') ||
        rel.includes('councillor') ||
        rel.includes('ward') ||
        rel.includes('institution') ||
        rel.includes('hospital') ||
        rel.includes('clinic') ||
        rel.includes('ngo')
      );
    });
    if (!hasInstitution) {
      return res.status(400).json({
        message:
          'At least one reference must be a ward councilor or institution',
      });
    }

    doc.references = normalized;
    if (typeof approved === 'boolean') {
      if (approved && normalized.filter((r) => r.verified).length < 2) {
        return res.status(400).json({
          message: 'At least two verified references are required to approve',
        });
      }
      doc.referenceCheck = approved;
      doc.referencesReviewedAt = new Date();
      doc.referencesReviewedBy = req.auth.userId;
    }
    markInProgress(doc);
    await doc.save();

    const populated = await loadVetting(doc._id);
    res.json({
      message: 'References updated',
      record: vettingDto(populated),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProbation(req, res, next) {
  try {
    const doc = await CaregiverVetting.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Vetting record not found' });
    }
    if (doc.status === 'activated' || doc.status === 'rejected') {
      return res.status(400).json({ message: 'Cannot update a closed vetting record' });
    }

    const { probationStatus, note } = req.body;
    if (!PROBATION_STATUSES.includes(probationStatus)) {
      return res.status(400).json({ message: 'Invalid probation status' });
    }

    doc.probationStatus = probationStatus;
    if (note !== undefined) {
      doc.probationNote = String(note).trim();
    }
    doc.probationReviewedAt = new Date();
    doc.probationReviewedBy = req.auth.userId;
    markInProgress(doc);
    await doc.save();

    const populated = await loadVetting(doc._id);
    res.json({
      message: 'Probation status updated',
      record: vettingDto(populated),
    });
  } catch (err) {
    next(err);
  }
}

export async function activateVetting(req, res, next) {
  try {
    const doc = await CaregiverVetting.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Vetting record not found' });
    }
    if (doc.status === 'activated') {
      return res.status(400).json({ message: 'Already activated' });
    }
    if (doc.status === 'rejected') {
      return res.status(400).json({ message: 'Rejected records cannot be activated' });
    }

    if (!doc.nidVerified || !doc.policeClearance || !doc.referenceCheck) {
      return res.status(400).json({
        message:
          'NID, police clearance, and reference checks must all be approved',
      });
    }
    if (doc.probationStatus !== 'passed') {
      return res.status(400).json({
        message: 'Probation must be marked as passed before activation',
      });
    }

    doc.status = 'activated';
    doc.activatedAt = new Date();
    await doc.save();

    await User.findByIdAndUpdate(doc.caregiverId, {
      verificationStatus: 'verified',
    });

    const populated = await loadVetting(doc._id);
    res.json({
      message: 'Caregiver activated for assignments',
      record: vettingDto(populated),
    });
  } catch (err) {
    next(err);
  }
}

export async function rejectVetting(req, res, next) {
  try {
    const doc = await CaregiverVetting.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Vetting record not found' });
    }
    if (doc.status === 'activated') {
      return res.status(400).json({ message: 'Activated records cannot be rejected' });
    }

    const reason = String(req.body.reason || '').trim();
    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    doc.status = 'rejected';
    doc.rejectionReason = reason;
    doc.rejectedAt = new Date();
    await doc.save();

    await User.findByIdAndUpdate(doc.caregiverId, {
      verificationStatus: 'unverified',
    });

    const populated = await loadVetting(doc._id);
    res.json({
      message: 'Vetting rejected',
      record: vettingDto(populated),
    });
  } catch (err) {
    next(err);
  }
}
