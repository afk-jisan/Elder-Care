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

async function ensureActivePlan(familyToken, caregiverToken) {
  const elderRes = await request('/family/elders', {
    method: 'POST',
    token: familyToken,
    body: {
      name: `Rx Elder ${Date.now()}`,
      address: 'Banani, Dhaka',
      latitude: 23.7937,
      longitude: 90.4066,
    },
  });
  const caregivers = await request('/family/caregivers', { token: familyToken });
  const caregiver = caregivers.caregivers.find(
    (c) => c.email === 'rafiq.caregiver@eldercare.bd'
  );
  assert(caregiver, 'Seed caregiver missing');
  const plan = await request('/family/care-plans', {
    method: 'POST',
    token: familyToken,
    body: {
      elderId: elderRes.elder.id,
      package: 'Medical',
      caregiverId: caregiver.id,
    },
  });
  await request(`/caregiver/assignments/${plan.carePlan.id}/respond`, {
    method: 'POST',
    token: caregiverToken,
    body: { decision: 'accept' },
  });
  return elderRes.elder.id;
}

async function run() {
  console.log('FR-03 test starting...');
  const familyToken = await login('nusrat.family@eldercare.bd', '12345678');
  const caregiverToken = await login(
    'rafiq.caregiver@eldercare.bd',
    '12345678'
  );
  const elderId = await ensureActivePlan(familyToken, caregiverToken);

  const tinyGifBase64 =
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  const uploaded = await request('/caregiver/prescriptions', {
    method: 'POST',
    token: caregiverToken,
    body: {
      elderId,
      imageBase64: tinyGifBase64,
      caption: 'Morning meds photo',
    },
  });
  assert(uploaded.prescription?.id, 'Prescription missing');
  assert(
    String(uploaded.prescription.imageUrl).includes('ibb.co') ||
      String(uploaded.prescription.imageUrl).includes('/uploads/'),
    'Expected ImgBB or local hosted URL'
  );

  const familyList = await request('/family/prescriptions', {
    token: familyToken,
  });
  assert(
    familyList.prescriptions.some((p) => p.id === uploaded.prescription.id),
    'Family should see caregiver upload'
  );

  const vault = await request('/family/vault', { token: familyToken });
  assert(
    vault.documents.some((d) => d.url === uploaded.prescription.imageUrl),
    'Upload should also land in vault'
  );
  console.log('FR-03 test passed');
}

run().catch((err) => {
  console.error('FR-03 test failed:', err.message);
  process.exit(1);
});
