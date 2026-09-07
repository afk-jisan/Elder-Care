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
  console.log('FR-07 test starting...');
  const familyToken = await login('nusrat.family@eldercare.bd', '12345678');
  const caregivers = await request('/family/caregivers', { token: familyToken });
  const caregiver = caregivers.caregivers[0];
  assert(caregiver, 'Need a vetted caregiver');

  await request('/family/wallet/load', {
    method: 'POST',
    token: familyToken,
    body: { amount: 20000 },
  });

  const small = await request('/family/wallet/release', {
    method: 'POST',
    token: familyToken,
    body: { amount: 1500, caregiverId: caregiver.id },
  });
  assert(small.payment.status === 'completed', 'Small release should complete');

  const pending = await request('/family/wallet/release', {
    method: 'POST',
    token: familyToken,
    body: { amount: 12000, caregiverId: caregiver.id },
  });
  assert(pending.payment.status === 'pending', 'Large release needs OTP');

  const confirmed = await request(
    `/family/wallet/payments/${pending.payment.id}/confirm-otp`,
    {
      method: 'POST',
      token: familyToken,
      body: { otp: '123456' },
    }
  );
  assert(confirmed.payment.status === 'completed', 'OTP confirm failed');

  const caregiverToken = await login(
    'rafiq.caregiver@eldercare.bd',
    '12345678'
  );
  const received = await request('/caregiver/payments', {
    token: caregiverToken,
  });
  assert(
    Array.isArray(received.payments) && received.payments.length > 0,
    'Caregiver should see released payments'
  );
  console.log('FR-07 test passed');
}

run().catch((err) => {
  console.error('FR-07 test failed:', err.message);
  process.exit(1);
});
