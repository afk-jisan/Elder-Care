import 'dotenv/config';

const BASE = process.env.API_URL || 'http://localhost:5000/api';

async function request(path, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `${method} ${path} failed (${res.status})`);
  }
  return data;
}

async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  return data.token;
}

async function run() {
  console.log('FR-01 test starting...');
  const familyToken = await login('nusrat.family@eldercare.bd', '12345678');
  const caregiverToken = await login(
    'rafiq.caregiver@eldercare.bd',
    '12345678'
  );

  const elderRes = await request('/family/elders', {
    method: 'POST',
    token: familyToken,
    body: {
      name: 'Rashida Begum',
      address: 'Banani, Dhaka',
      latitude: 23.7937,
      longitude: 90.4066,
    },
  });
  const elderId = elderRes.elder.id;

  const caregivers = await request('/family/caregivers', {
    token: familyToken,
  });
  const caregiver = caregivers.caregivers.find(
    (c) => c.email === 'rafiq.caregiver@eldercare.bd'
  );
  if (!caregiver) throw new Error('Seed caregiver missing');

  const plan = await request('/family/care-plans', {
    method: 'POST',
    token: familyToken,
    body: {
      elderId,
      package: 'Companion',
      caregiverId: caregiver.id,
    },
  });

  await request(`/caregiver/assignments/${plan.carePlan.id}/respond`, {
    method: 'POST',
    token: caregiverToken,
    body: { decision: 'accept' },
  });

  // Far away should fail
  let rejected = false;
  try {
    await request('/caregiver/check-in', {
      method: 'POST',
      token: caregiverToken,
      body: {
        elderId,
        latitude: 23.8103,
        longitude: 90.4125,
      },
    });
  } catch {
    rejected = true;
  }
  if (!rejected) throw new Error('Expected far check-in to fail');
  console.log('Far check-in correctly rejected');

  const near = await request('/caregiver/check-in', {
    method: 'POST',
    token: caregiverToken,
    body: {
      elderId,
      latitude: 23.7937,
      longitude: 90.4066,
    },
  });
  console.log('Checked in:', near.visit.id);

  const out = await request('/caregiver/check-out', {
    method: 'POST',
    token: caregiverToken,
    body: {
      latitude: 23.79371,
      longitude: 90.40661,
      photoUrl: 'data:image/png;base64,testphoto',
    },
  });
  if (out.visit.status !== 'checked_out') {
    throw new Error('Expected checked_out status');
  }

  console.log('FR-01 test passed');
}

run().catch((err) => {
  console.error('FR-01 test failed:', err.message);
  process.exit(1);
});
