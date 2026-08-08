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

async function run() {
  console.log('FR-14 test starting...');
  const login = await request('/auth/login', {
    method: 'POST',
    body: {
      email: 'samira.doctor@eldercare.bd',
      password: '12345678',
    },
  });
  const token = login.token;

  const created = await request('/doctor/availability', {
    method: 'POST',
    token,
    body: {
      dayOfWeek: 'Tuesday',
      startTime: '10:00',
      endTime: '13:00',
    },
  });
  console.log('Created slot:', created.availability.id);

  const listed = await request('/doctor/availability', { token });
  const found = listed.availability.find(
    (s) => s.id === created.availability.id
  );
  if (!found) throw new Error('Created slot missing from list');

  await request(`/doctor/availability/${created.availability.id}`, {
    method: 'DELETE',
    token,
  });

  const after = await request('/doctor/availability', { token });
  if (after.availability.some((s) => s.id === created.availability.id)) {
    throw new Error('Slot still present after delete');
  }

  console.log('FR-14 test passed');
}

run().catch((err) => {
  console.error('FR-14 test failed:', err.message);
  process.exit(1);
});
