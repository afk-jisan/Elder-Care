import 'dotenv/config';

const BASE = process.env.API_URL || 'http://localhost:5000/api';

async function request(path, { method = 'GET', token, body, raw } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (raw) {
    if (!res.ok) throw new Error(`${method} ${path} failed (${res.status})`);
    return res.text();
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `${method} ${path} failed (${res.status})`);
  }
  return data;
}

async function login(email) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: { email, password: '12345678' },
  });
  return data.token;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  console.log('FR-18 / FR-19 / FR-20 test starting...');
  const familyToken = await login('nusrat.family@eldercare.bd');
  const caregiverToken = await login('rafiq.caregiver@eldercare.bd');
  const adminToken = await login('karim.admin@eldercare.bd');

  const caregivers = await request('/family/caregivers', { token: familyToken });
  const caregiver = caregivers.caregivers[0];
  assert(caregiver, 'Need caregiver');

  await request('/family/wallet/load', {
    method: 'POST',
    token: familyToken,
    body: { amount: 5000 },
  });
  const release = await request('/family/wallet/release', {
    method: 'POST',
    token: familyToken,
    body: { amount: 800, caregiverId: caregiver.id },
  });
  assert(release.payment?.status === 'completed', 'Need completed payment');

  const dispute = await request('/family/disputes', {
    method: 'POST',
    token: familyToken,
    body: {
      paymentId: release.payment.id,
      evidence: 'Caregiver missed scheduled visit',
    },
  });
  assert(dispute.disputeId, 'Dispute should open');

  const listed = await request('/admin/disputes', { token: adminToken });
  const open = listed.disputes.find((d) => d.id === dispute.disputeId);
  assert(open?.status === 'open', 'Admin should see open dispute');

  const remainingBefore = (
    await request('/family/wallet', { token: familyToken })
  ).wallet.remainingBudget;

  const resolved = await request(
    `/admin/disputes/${dispute.disputeId}/resolve`,
    {
      method: 'POST',
      token: adminToken,
      body: {
        ruling: 'refund_family',
        reason: 'Evidence supports family claim',
      },
    }
  );
  assert(resolved.ruling === 'refund_family', 'Ruling should stick');
  const remainingAfter = (
    await request('/family/wallet', { token: familyToken })
  ).wallet.remainingBudget;
  assert(
    remainingAfter === remainingBefore + 800,
    'Refund should return money to the family wallet'
  );

  const splitPay = await request('/family/wallet/release', {
    method: 'POST',
    token: familyToken,
    body: { amount: 200, caregiverId: caregiver.id },
  });
  const splitDispute = await request('/family/disputes', {
    method: 'POST',
    token: familyToken,
    body: {
      paymentId: splitPay.payment.id,
      evidence: 'Visit was only half completed',
    },
  });
  const remainingBeforeSplit = (
    await request('/family/wallet', { token: familyToken })
  ).wallet.remainingBudget;
  await request(`/admin/disputes/${splitDispute.disputeId}/resolve`, {
    method: 'POST',
    token: adminToken,
    body: {
      ruling: 'split',
      reason: 'Split 50 / 50',
    },
  });
  const remainingAfterSplit = (
    await request('/family/wallet', { token: familyToken })
  ).wallet.remainingBudget;
  assert(
    remainingAfterSplit === remainingBeforeSplit + 100,
    'Split should return half to the family wallet'
  );
  const caregiverPays = await request('/caregiver/payments', {
    token: caregiverToken,
  });
  const splitRow = caregiverPays.payments.find(
    (p) => p.id === splitPay.payment.id
  );
  assert(splitRow?.amount === 100, 'Caregiver should keep only half after split');
  console.log('FR-18 OK');

  const assignments = await request('/caregiver/assignments/active', {
    token: caregiverToken,
  });
  const elderId = assignments.assignments[0].elder.id;
  const sos = await request('/caregiver/sos', {
    method: 'POST',
    token: caregiverToken,
    body: { elderId, latitude: 23.81, longitude: 90.41 },
  });
  assert(sos.sosEvent?.id, 'SOS should create');

  const sosList = await request('/admin/sos', { token: adminToken });
  const event = sosList.events.find((e) => e.id === sos.sosEvent.id);
  assert(event, 'Admin should see SOS');

  await request(`/admin/sos/${sos.sosEvent.id}/escalate`, {
    method: 'POST',
    token: adminToken,
  });
  await request(`/admin/sos/${sos.sosEvent.id}/resolve`, {
    method: 'POST',
    token: adminToken,
    body: { resolutionNote: 'Family confirmed safe' },
  });
  console.log('FR-19 OK');

  const analytics = await request('/admin/analytics', { token: adminToken });
  assert(analytics.report?.activeElders >= 0, 'Analytics report missing');
  const csv = await request('/admin/analytics?format=csv', {
    token: adminToken,
    raw: true,
  });
  assert(csv.includes('metric,value'), 'CSV header missing');
  console.log('FR-20 OK');

  console.log('FR-18 / FR-19 / FR-20 test passed');
}

run().catch((err) => {
  console.error('FR-18 / FR-19 / FR-20 test failed:', err.message);
  process.exit(1);
});
