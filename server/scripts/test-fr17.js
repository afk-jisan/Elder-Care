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
  console.log('FR-17 test starting...');
  const adminToken = await login('karim.admin@eldercare.bd', '12345678');
  const familyToken = await login('nusrat.family@eldercare.bd', '12345678');

  const stamp = Date.now();
  const created = await request('/admin/users', {
    method: 'POST',
    token: adminToken,
    body: {
      name: 'Vetting Candidate',
      email: `vetting.candidate.${stamp}@eldercare.bd`,
      phone: `017${String(stamp).slice(-8)}`,
      password: '12345678',
      role: 'caregiver',
    },
  });
  const caregiverId = created.user.id;
  console.log('Created unverified caregiver:', caregiverId);

  const before = await request('/family/caregivers', { token: familyToken });
  assert(
    !before.caregivers.some((c) => c.id === caregiverId),
    'Unvetted caregiver must not appear in family pool'
  );
  console.log('Pool correctly excludes unvetted caregiver');

  const started = await request(`/admin/vetting/${caregiverId}/start`, {
    method: 'POST',
    token: adminToken,
  });
  const vettingId = started.record.id;
  console.log('Started vetting:', vettingId);

  await request(`/admin/vetting/${vettingId}/nid`, {
    method: 'PATCH',
    token: adminToken,
    body: { approved: true, nidNumber: `9${String(stamp).slice(-7)}` },
  });

  await request(`/admin/vetting/${vettingId}/police`, {
    method: 'PATCH',
    token: adminToken,
    body: {
      approved: true,
      documentUrl: 'https://example.local/police-clearance.pdf',
    },
  });

  await request(`/admin/vetting/${vettingId}/references`, {
    method: 'PATCH',
    token: adminToken,
    body: {
      approved: true,
      references: [
        {
          name: 'Ward Councilor Rahman',
          relation: 'Ward councilor',
          note: 'Local reference',
          verified: true,
        },
        {
          name: 'City Hospital HR',
          relation: 'Institution',
          note: 'Prior volunteer',
          verified: true,
        },
      ],
    },
  });

  await request(`/admin/vetting/${vettingId}/probation`, {
    method: 'PATCH',
    token: adminToken,
    body: {
      probationStatus: 'passed',
      note: 'Completed demo probation review',
    },
  });

  const activated = await request(`/admin/vetting/${vettingId}/activate`, {
    method: 'POST',
    token: adminToken,
  });
  assert(activated.record.status === 'activated', 'Expected activated status');
  console.log('Activated caregiver');

  const after = await request('/family/caregivers', { token: familyToken });
  assert(
    after.caregivers.some((c) => c.id === caregiverId),
    'Activated caregiver must appear in family pool'
  );
  console.log('Pool correctly includes activated caregiver');

  const rejectCandidate = await request('/admin/users', {
    method: 'POST',
    token: adminToken,
    body: {
      name: 'Reject Candidate',
      email: `vetting.reject.${stamp}@eldercare.bd`,
      phone: `018${String(stamp).slice(-8)}`,
      password: '12345678',
      role: 'caregiver',
    },
  });
  const rejectStart = await request(
    `/admin/vetting/${rejectCandidate.user.id}/start`,
    { method: 'POST', token: adminToken }
  );
  const rejected = await request(
    `/admin/vetting/${rejectStart.record.id}/reject`,
    {
      method: 'POST',
      token: adminToken,
      body: { reason: 'Incomplete police clearance documents' },
    }
  );
  assert(rejected.record.status === 'rejected', 'Expected rejected status');

  const poolAfterReject = await request('/family/caregivers', {
    token: familyToken,
  });
  assert(
    !poolAfterReject.caregivers.some((c) => c.id === rejectCandidate.user.id),
    'Rejected caregiver must not appear in family pool'
  );
  console.log('Reject path OK');

  const seeded = after.caregivers.find(
    (c) => c.email === 'rafiq.caregiver@eldercare.bd'
  );
  assert(seeded, 'Seeded demo caregiver should remain in vetted pool');
  console.log('Seeded caregiver still in pool');

  console.log('FR-17 test passed');
}

run().catch((err) => {
  console.error('FR-17 test failed:', err.message);
  process.exit(1);
});
