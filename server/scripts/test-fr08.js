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
  console.log('FR-08 test starting...');
  const familyToken = await login('nusrat.family@eldercare.bd', '12345678');
  await request('/family/wallet/load', {
    method: 'POST',
    token: familyToken,
    body: { amount: 5000 },
  });

  const elders = await request('/family/elders', { token: familyToken });
  let elderId = elders.elders[0]?.id;
  if (!elderId) {
    const created = await request('/family/elders', {
      method: 'POST',
      token: familyToken,
      body: {
        name: 'Utility Elder',
        address: 'Mirpur, Dhaka',
        latitude: 23.8067,
        longitude: 90.3686,
      },
    });
    elderId = created.elder.id;
  }

  const bill = await request('/family/utilities', {
    method: 'POST',
    token: familyToken,
    body: {
      elderId,
      provider: 'DESCO',
      accountNumber: 'DESCO-9988',
      amount: 850,
      billPhotoUrl: 'https://example.local/bill.jpg',
    },
  });

  const paid = await request(`/family/utilities/${bill.bill.id}/pay`, {
    method: 'POST',
    token: familyToken,
  });
  assert(paid.bill.paid === true, 'Bill should be paid');
  console.log('FR-08 test passed');
}

run().catch((err) => {
  console.error('FR-08 test failed:', err.message);
  process.exit(1);
});
