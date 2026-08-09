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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  console.log('FR-04 test starting...');
  const familyToken = await login('nusrat.family@eldercare.bd', '12345678');
  const caregiverToken = await login(
    'rafiq.caregiver@eldercare.bd',
    '12345678'
  );

  const existingVisit = await request('/caregiver/visits/active', {
    token: caregiverToken,
  });
  if (existingVisit.visit) {
    const elder = existingVisit.visit.elder;
    await request('/caregiver/check-out', {
      method: 'POST',
      token: caregiverToken,
      body: {
        latitude: elder?.latitude ?? 23.79371,
        longitude: elder?.longitude ?? 90.40661,
        photoUrl: 'data:image/png;base64,preclear',
      },
    });
  }

  const elderRes = await request('/family/elders', {
    method: 'POST',
    token: familyToken,
    body: {
      name: 'Vitals Elder',
      address: 'Banani, Dhaka',
      latitude: 23.7937,
      longitude: 90.4066,
    },
  });
  const elderId = elderRes.elder.id;

  const caregivers = await request('/family/caregivers', { token: familyToken });
  const caregiver = caregivers.caregivers.find(
    (c) => c.email === 'rafiq.caregiver@eldercare.bd'
  );
  assert(caregiver, 'Seed caregiver missing');

  const plan = await request('/family/care-plans', {
    method: 'POST',
    token: familyToken,
    body: {
      elderId,
      package: 'Medical',
      caregiverId: caregiver.id,
    },
  });
  await request(`/caregiver/assignments/${plan.carePlan.id}/respond`, {
    method: 'POST',
    token: caregiverToken,
    body: { decision: 'accept' },
  });

  const normal = await request('/caregiver/vitals', {
    method: 'POST',
    token: caregiverToken,
    body: {
      elderId,
      bloodPressure: '118/76',
      bloodSugar: 5.4,
      weight: 62,
      behavioralNotes: 'Cheerful and engaged',
    },
  });
  assert(normal.vitalsLog.flagged === false, 'Normal notes should not flag');
  console.log('Normal vitals OK');

  const flagged = await request('/caregiver/vitals', {
    method: 'POST',
    token: caregiverToken,
    body: {
      elderId,
      bloodPressure: '130/85',
      bloodSugar: 6.1,
      weight: 61.5,
      temperature: 37.2,
      behavioralNotes: 'Seemed confused after lunch',
    },
  });
  assert(flagged.vitalsLog.flagged === true, 'Decline keyword should flag');
  console.log('Flagged vitals OK');

  const familyView = await request('/family/vitals?flagged=true', {
    token: familyToken,
  });
  assert(
    familyView.vitalsLogs.some((l) => l.id === flagged.vitalsLog.id),
    'Family should see flagged vitals'
  );
  console.log('Family flagged view OK');

  console.log('FR-04 test passed');
}

run().catch((err) => {
  console.error('FR-04 test failed:', err.message);
  process.exit(1);
});
