import crypto from 'crypto';
import {
  MedicalDocument,
  DOCUMENT_TYPES,
} from '../models/MedicalDocument.js';
import { Elder } from '../models/Elder.js';

function docDto(doc) {
  return {
    id: doc._id.toString(),
    elderId: doc.elderId?._id
      ? doc.elderId._id.toString()
      : doc.elderId.toString(),
    elder: doc.elderId?.name
      ? { id: doc.elderId._id.toString(), name: doc.elderId.name }
      : undefined,
    type: doc.type,
    title: doc.title,
    url: doc.url,
    notes: doc.notes,
    shareToken: doc.shareToken,
    shareExpiresAt: doc.shareExpiresAt,
    createdAt: doc.createdAt,
  };
}

export async function listVaultDocuments(req, res, next) {
  try {
    const filter = { familyMemberId: req.auth.userId };
    if (req.query.elderId) filter.elderId = req.query.elderId;
    const docs = await MedicalDocument.find(filter)
      .populate('elderId', 'name')
      .sort({ createdAt: -1 });
    res.json({ documents: docs.map(docDto) });
  } catch (err) {
    next(err);
  }
}

export async function uploadVaultDocument(req, res, next) {
  try {
    const { elderId, type, title, url, notes } = req.body;
    if (!elderId || !type || !title || !url) {
      return res.status(400).json({
        message: 'Elder, type, title, and URL are required',
      });
    }
    if (!DOCUMENT_TYPES.includes(type)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    const elder = await Elder.findOne({
      _id: elderId,
      familyMemberId: req.auth.userId,
    });
    if (!elder) {
      return res.status(404).json({ message: 'Elder not found' });
    }

    const doc = await MedicalDocument.create({
      elderId,
      familyMemberId: req.auth.userId,
      type,
      title: String(title).trim(),
      url: String(url).trim(),
      notes: String(notes || '').trim(),
    });

    const populated = await MedicalDocument.findById(doc._id).populate(
      'elderId',
      'name'
    );
    res.status(201).json({
      message: 'Document saved to vault',
      document: docDto(populated),
    });
  } catch (err) {
    next(err);
  }
}

export async function createShareLink(req, res, next) {
  try {
    const hours = Number(req.body.hours || 24);
    if (Number.isNaN(hours) || hours < 1 || hours > 168) {
      return res.status(400).json({
        message: 'hours must be between 1 and 168',
      });
    }

    const doc = await MedicalDocument.findOne({
      _id: req.params.id,
      familyMemberId: req.auth.userId,
    });
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    doc.shareToken = crypto.randomBytes(16).toString('hex');
    doc.shareExpiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
    await doc.save();

    res.json({
      message: 'Share link created',
      shareToken: doc.shareToken,
      shareExpiresAt: doc.shareExpiresAt,
      sharePath: `/api/vault/shared/${doc.shareToken}`,
    });
  } catch (err) {
    next(err);
  }
}

export async function getSharedDocument(req, res, next) {
  try {
    const doc = await MedicalDocument.findOne({
      shareToken: req.params.token,
    }).populate('elderId', 'name');
    if (!doc) {
      return res.status(404).json({ message: 'Share link not found' });
    }
    if (!doc.shareExpiresAt || doc.shareExpiresAt.getTime() < Date.now()) {
      return res.status(410).json({ message: 'Share link expired' });
    }
    res.json({ document: docDto(doc) });
  } catch (err) {
    next(err);
  }
}
