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
  console.log('FR-06 test starting...');
  const familyToken = await login(
    'nusrat.family@eldercare.bd',
    '12345678'
  );
  const caregiverToken = await login(
    'rafiq.caregiver@eldercare.bd',
    '12345678'
  );

  const elder = await request('/family/elders', {
    method: 'POST',
    token: familyToken,
    body: {
      name: 'Abdul Karim',
      address: 'Mirpur 10, Dhaka',
      latitude: 23.8067,
      longitude: 90.3686,
    },
  });
  console.log('Created elder:', elder.elder.id);

  const caregivers = await request('/family/caregivers', {
    token: familyToken,
  });
  const caregiver = caregivers.caregivers[0];
  if (!caregiver) throw new Error('No active caregiver found');

  const plan = await request('/family/care-plans', {
    method: 'POST',
    token: familyToken,
    body: {
      elderId: elder.elder.id,
      package: 'Medical',
      caregiverId: caregiver.id,
    },
  });
  console.log('Created plan:', plan.carePlan.id, plan.carePlan.status);

  const pending = await request('/caregiver/assignments/pending', {
    token: caregiverToken,
  });
  const match = pending.carePlans.find((p) => p.id === plan.carePlan.id);
  if (!match) throw new Error('Pending assignment not visible to caregiver');

  const accepted = await request(
    `/caregiver/assignments/${plan.carePlan.id}/respond`,
    {
      method: 'POST',
      token: caregiverToken,
      body: { decision: 'accept' },
    }
  );
  if (accepted.carePlan.status !== 'active') {
    throw new Error('Expected active status after accept');
  }

  console.log('FR-06 test passed');
}

run().catch((err) => {
  console.error('FR-06 test failed:', err.message);
  process.exit(1);
});
