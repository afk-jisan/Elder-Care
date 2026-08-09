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

function todayName() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' });
}

async function ensureDoctorAvailable(doctorToken) {
  const day = todayName();
  const listed = await request('/doctor/availability', { token: doctorToken });
  const covering = (listed.availability || []).find(
    (s) => s.dayOfWeek === day && s.startTime <= '00:00' && s.endTime >= '23:59'
  );
  if (covering) return covering.id;
  // clear same-day slots then add all-day
  for (const s of listed.availability || []) {
    if (s.dayOfWeek === day) {
      await request(`/doctor/availability/${s.id}`, {
        method: 'DELETE',
        token: doctorToken,
      });
    }
  }
  const created = await request('/doctor/availability', {
    method: 'POST',
    token: doctorToken,
    body: { dayOfWeek: day, startTime: '00:00', endTime: '23:59' },
  });
  return created.availability.id;
}

async function run() {
  console.log('FR-02 / FR-11 test starting...');
  const caregiverToken = await login('rafiq.caregiver@eldercare.bd');
  const doctorToken = await login('samira.doctor@eldercare.bd');

  await ensureDoctorAvailable(doctorToken);

  const assignments = await request('/caregiver/assignments/active', {
    token: caregiverToken,
  });
  assert(assignments.assignments?.length > 0, 'Need active elder assignment');
  const elderId = assignments.assignments[0].elder.id;

  const available = await request('/caregiver/doctors/available', {
    token: caregiverToken,
  });
  assert(available.doctors?.length > 0, 'Doctor should be available now');
  const doctorId = available.doctors[0].id;

  const created = await request('/caregiver/sessions', {
    method: 'POST',
    token: caregiverToken,
    body: { elderId, doctorId },
  });
  assert(created.session?.status === 'requested', 'Session should be requested');
  assert(created.session?.roomId?.startsWith('mock-100ms-'), 'Mock room id');
  console.log('FR-02 initiate OK:', created.session.id);

  const doctorSessions = await request('/doctor/sessions', {
    token: doctorToken,
  });
  const pending = doctorSessions.sessions.find((s) => s.id === created.session.id);
  assert(pending, 'Doctor should see session');

  const accepted = await request(
    `/doctor/sessions/${created.session.id}/respond`,
    {
      method: 'POST',
      token: doctorToken,
      body: { decision: 'accept' },
    }
  );
  assert(accepted.session.status === 'active', 'Session should become active');
  console.log('FR-11 join OK:', accepted.session.roomId);

  const ended = await request(`/doctor/sessions/${created.session.id}/end`, {
    method: 'POST',
    token: doctorToken,
  });
  assert(ended.session.status === 'ended', 'Session should end');

  console.log('FR-02 / FR-11 test passed');
}

run().catch((err) => {
  console.error('FR-02 / FR-11 test failed:', err.message);
  process.exit(1);
});
