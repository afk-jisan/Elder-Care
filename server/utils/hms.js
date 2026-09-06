import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const HMS_API = 'https://api.100ms.live/v2';
// Default workspace template for ElderCare consult rooms (roles: doctor, patient).
const DEFAULT_HMS_TEMPLATE_ID = '698c59eb970f62489e2aa9a1';

function requireHmsConfig() {
  const accessKey = process.env.HMS_ACCESS_KEY;
  const secret = process.env.HMS_APP_SECRET;
  if (!accessKey || !secret) {
    throw new Error('HMS_ACCESS_KEY and HMS_APP_SECRET are required');
  }
  return { accessKey, secret };
}

export function hasHmsConfig() {
  return Boolean(process.env.HMS_ACCESS_KEY && process.env.HMS_APP_SECRET);
}

export function createManagementToken(expiresIn = '24h') {
  const { accessKey, secret } = requireHmsConfig();
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      access_key: accessKey,
      type: 'management',
      version: 2,
      iat: now,
      nbf: now,
    },
    secret,
    { algorithm: 'HS256', expiresIn, jwtid: crypto.randomUUID() }
  );
}

export function createClientAuthToken({
  roomId,
  userId,
  role,
  expiresIn = '24h',
}) {
  const { accessKey, secret } = requireHmsConfig();
  if (!roomId || !userId || !role) {
    throw new Error('roomId, userId, and role are required for auth token');
  }
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      access_key: accessKey,
      room_id: roomId,
      user_id: String(userId),
      role,
      type: 'app',
      version: 2,
      iat: now,
      nbf: now,
    },
    secret,
    { algorithm: 'HS256', expiresIn, jwtid: crypto.randomUUID() }
  );
}

async function hmsFetch(path, { method = 'GET', body } = {}) {
  const token = createManagementToken();
  const res = await fetch(`${HMS_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data?.message ||
      data?.error ||
      (typeof data === 'string' ? data : null) ||
      `100ms ${method} ${path} failed (${res.status})`;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data;
}

export async function createHmsRoom({ name, description } = {}) {
  const payload = {
    name: name || `eldercare-${Date.now()}`,
    description: description || 'ElderCare medical consultation',
  };
  if (process.env.HMS_TEMPLATE_ID) {
    payload.template_id = process.env.HMS_TEMPLATE_ID;
  } else {
    payload.template_id = DEFAULT_HMS_TEMPLATE_ID;
  }
  const room = await hmsFetch('/rooms', { method: 'POST', body: payload });
  return {
    id: room.id,
    name: room.name,
    enabled: room.enabled,
  };
}

export function doctorRole() {
  return process.env.HMS_ROLE_DOCTOR || 'doctor';
}

export function caregiverRole() {
  return process.env.HMS_ROLE_CAREGIVER || 'patient';
}

export async function createRoomCodes(roomId) {
  return hmsFetch(`/room-codes/room/${roomId}`, { method: 'POST' });
}
