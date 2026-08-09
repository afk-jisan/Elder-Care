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
  console.log('FR-09 test starting...');
  const familyToken = await login('nusrat.family@eldercare.bd', '12345678');
  const elders = await request('/family/elders', { token: familyToken });
  let elderId = elders.elders[0]?.id;
  if (!elderId) {
    const created = await request('/family/elders', {
      method: 'POST',
      token: familyToken,
      body: {
        name: 'Vault Elder',
        address: 'Dhanmondi, Dhaka',
        latitude: 23.7461,
        longitude: 90.3742,
      },
    });
    elderId = created.elder.id;
  }

  const saved = await request('/family/vault', {
    method: 'POST',
    token: familyToken,
    body: {
      elderId,
      type: 'allergy_list',
      title: 'Known allergies',
      url: 'https://example.local/allergies.txt',
      notes: 'Penicillin',
    },
  });
  assert(saved.document?.id, 'Document missing');

  const share = await request(`/family/vault/${saved.document.id}/share`, {
    method: 'POST',
    token: familyToken,
    body: { hours: 2 },
  });
  assert(share.shareToken, 'Share token missing');

  const publicDoc = await request(`/vault/shared/${share.shareToken}`);
  assert(publicDoc.document.id === saved.document.id, 'Shared doc mismatch');
  console.log('FR-09 test passed');
}

run().catch((err) => {
  console.error('FR-09 test failed:', err.message);
  process.exit(1);
});
