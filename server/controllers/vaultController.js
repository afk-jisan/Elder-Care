import crypto from 'crypto';
import {
  MedicalDocument,
  DOCUMENT_TYPES,
} from '../models/MedicalDocument.js';
import { Elder } from '../models/Elder.js';
import { uploadToImgbb, hasImageUploadConfig } from '../utils/imgbb.js';

const MIME_LABELS = {
  'image/jpeg': 'JPEG',
  'image/jpg': 'JPEG',
  'image/png': 'PNG',
  'image/gif': 'GIF',
  'image/webp': 'WEBP',
  'application/pdf': 'PDF',
  'text/plain': 'TXT',
};

const EXT_LABELS = {
  jpg: 'JPEG',
  jpeg: 'JPEG',
  png: 'PNG',
  gif: 'GIF',
  webp: 'WEBP',
  pdf: 'PDF',
  txt: 'TXT',
  doc: 'DOC',
  docx: 'DOCX',
};

function labelFromMime(mime) {
  const key = String(mime || '').toLowerCase().split(';')[0].trim();
  return MIME_LABELS[key] || '';
}

function extensionFromName(value) {
  const match = String(value || '')
    .split('?')[0]
    .split('#')[0]
    .match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : '';
}

function inferFileType({ mimeType, fileName, url }) {
  const fromMime = labelFromMime(mimeType);
  if (fromMime) return fromMime;
  const ext =
    extensionFromName(fileName) || extensionFromName(url || '');
  if (EXT_LABELS[ext]) return EXT_LABELS[ext];
  if (ext) return ext.toUpperCase();
  if (url) return 'Link';
  return '';
}

function docDto(doc) {
  const url = doc.url;
  const fileType =
    doc.fileType || inferFileType({ fileName: doc.fileName, url });
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
    url,
    fileType,
    fileName: doc.fileName || '',
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
    const { elderId, type, title, url, imageBase64, notes, fileName, mimeType } =
      req.body;
    if (!elderId || !type || !title || (!url && !imageBase64)) {
      return res.status(400).json({
        message: 'Elder, type, title, and URL or image are required',
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

    let finalUrl = url ? String(url).trim() : '';
    let detectedMime = mimeType || '';
    if (imageBase64) {
      if (!hasImageUploadConfig()) {
        return res.status(503).json({
          message: 'Image upload is not configured',
        });
      }
      if (!detectedMime && String(imageBase64).startsWith('data:')) {
        detectedMime = String(imageBase64).slice(5).split(';')[0] || '';
      }
      const uploaded = await uploadToImgbb(imageBase64, {
        name: `vault-${elderId}-${Date.now()}`,
      });
      finalUrl = uploaded.url;
    }

    const originalName = String(fileName || '').trim();
    const fileType = inferFileType({
      mimeType: detectedMime,
      fileName: originalName,
      url: finalUrl,
    });

    const doc = await MedicalDocument.create({
      elderId,
      familyMemberId: req.auth.userId,
      type,
      title: String(title).trim(),
      url: finalUrl,
      fileType,
      fileName: originalName,
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

    const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
    res.json({
      message: 'Share link created',
      shareToken: doc.shareToken,
      shareExpiresAt: doc.shareExpiresAt,
      sharePath: `/api/vault/shared/${doc.shareToken}`,
      shareUrl: `${clientOrigin}/share/${doc.shareToken}`,
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
