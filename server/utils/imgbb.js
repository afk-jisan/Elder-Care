import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

/**
 * ImgBB image upload (API v1), with local disk fallback when ImgBB rejects the key.
 * Accepts base64 (with or without data: prefix), binary Buffer, or remote URL.
 */
export async function uploadToImgbb(image, { name, expiration } = {}) {
  const key = process.env.IMGBB_API_KEY;
  if (!image) {
    throw new Error('image is required for image upload');
  }

  let payload = image;
  let mime = 'image/png';
  if (typeof payload === 'string' && payload.startsWith('data:')) {
    const match = payload.match(/^data:([^;]+);base64,(.*)$/);
    if (match) {
      mime = match[1] || mime;
      payload = match[2];
    } else {
      const comma = payload.indexOf(',');
      payload = comma >= 0 ? payload.slice(comma + 1) : payload;
    }
  }

  if (key) {
    try {
      const form = new FormData();
      if (Buffer.isBuffer(image)) {
        form.append('image', new Blob([image]), name || 'upload.bin');
      } else {
        form.append('image', String(payload));
      }
      if (name) form.append('name', name);

      const params = new URLSearchParams({ key });
      if (expiration) params.set('expiration', String(expiration));

      const res = await fetch(`https://api.imgbb.com/1/upload?${params}`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        return {
          id: data.data.id,
          url: data.data.url || data.data.display_url,
          displayUrl: data.data.display_url,
          deleteUrl: data.data.delete_url,
          width: data.data.width,
          height: data.data.height,
          provider: 'imgbb',
        };
      }
      const msg =
        data?.error?.message || data?.status_txt || 'ImgBB upload failed';
      // Code 103 = forbidden/disabled key. Fall through to local storage.
      console.warn(`[imgbb] ${msg}; using local upload fallback`);
    } catch (err) {
      console.warn(`[imgbb] ${err.message}; using local upload fallback`);
    }
  }

  return saveLocalUpload(payload, { name, mime });
}

async function saveLocalUpload(payload, { name, mime }) {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const ext =
    mime.includes('jpeg') || mime.includes('jpg')
      ? 'jpg'
      : mime.includes('gif')
        ? 'gif'
        : mime.includes('webp')
          ? 'webp'
          : 'png';
  const fileName = `${name || 'upload'}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const buffer = Buffer.isBuffer(payload)
    ? payload
    : Buffer.from(String(payload), 'base64');
  await fs.writeFile(path.join(UPLOADS_DIR, safeName), buffer);

  const base =
    process.env.PUBLIC_API_URL ||
    process.env.API_PUBLIC_URL ||
    `http://localhost:${process.env.PORT || 5000}`;
  const url = `${base.replace(/\/$/, '')}/uploads/${safeName}`;
  return {
    id: safeName,
    url,
    displayUrl: url,
    deleteUrl: null,
    provider: 'local',
  };
}

export function hasImgbbConfig() {
  return Boolean(process.env.IMGBB_API_KEY);
}

export function hasImageUploadConfig() {
  // Local fallback always available; ImgBB preferred when key works.
  return true;
}
