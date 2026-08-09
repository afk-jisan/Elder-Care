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
  console.log('FR-10 test starting...');
  const familyToken = await login('nusrat.family@eldercare.bd', '12345678');
  const feed = await request('/family/feed', { token: familyToken });
  assert(feed.feed, 'Feed payload missing');
  assert(Array.isArray(feed.feed.checkIns), 'checkIns missing');
  assert(Array.isArray(feed.feed.vitals), 'vitals missing');
  assert(Array.isArray(feed.feed.tasks), 'tasks missing');
  assert(Array.isArray(feed.feed.alerts), 'alerts missing');
  console.log('FR-10 test passed');
}

run().catch((err) => {
  console.error('FR-10 test failed:', err.message);
  process.exit(1);
});
