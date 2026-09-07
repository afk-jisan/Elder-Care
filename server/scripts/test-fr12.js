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
  for (const s of listed.availability || []) {
    if (s.dayOfWeek === day) {
      await request(`/doctor/availability/${s.id}`, {
        method: 'DELETE',
        token: doctorToken,
      });
    }
  }
  await request('/doctor/availability', {
    method: 'POST',
    token: doctorToken,
    body: { dayOfWeek: day, startTime: '00:00', endTime: '23:59' },
  });
}

async function createEndedSession(caregiverToken, doctorToken) {
  await ensureDoctorAvailable(doctorToken);
  const assignments = await request('/caregiver/assignments/active', {
    token: caregiverToken,
  });
  const elderId = assignments.assignments[0].elder.id;
  const available = await request('/caregiver/doctors/available', {
    token: caregiverToken,
  });
  const doctorId = available.doctors[0].id;
  const created = await request('/caregiver/sessions', {
    method: 'POST',
    token: caregiverToken,
    body: { elderId, doctorId },
  });
  await request(`/doctor/sessions/${created.session.id}/respond`, {
    method: 'POST',
    token: doctorToken,
    body: { decision: 'accept' },
  });
  const ended = await request(`/doctor/sessions/${created.session.id}/end`, {
    method: 'POST',
    token: doctorToken,
  });
  return { sessionId: ended.session.id, elderId };
}

async function run() {
  console.log('FR-12 / FR-13 / FR-15 test starting...');
  const caregiverToken = await login('rafiq.caregiver@eldercare.bd');
  const doctorToken = await login('samira.doctor@eldercare.bd');
  const familyToken = await login('nusrat.family@eldercare.bd');

  const assignments = await request('/caregiver/assignments/active', {
    token: caregiverToken,
  });
  const elderId = assignments.assignments[0].elder.id;

  await request('/caregiver/prescriptions', {
    method: 'POST',
    token: caregiverToken,
    body: {
      elderId,
      imageBase64:
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      caption: 'Uploaded for FR-12',
      medicineName: 'Amlodipine',
      dosage: '5mg',
    },
  });

  const rxList = await request('/doctor/prescriptions', { token: doctorToken });
  assert(
    rxList.prescriptions.some((p) => {
      const url = String(p.imageUrl || '');
      return url.includes('ibb.co') || url.includes('/uploads/');
    }),
    'Doctor should see hosted prescriptions'
  );
  console.log('FR-12 OK');

  const { sessionId } = await createEndedSession(caregiverToken, doctorToken);
  const notes = await request(`/doctor/sessions/${sessionId}/notes`, {
    method: 'POST',
    token: doctorToken,
    body: {
      notes: 'Stable vitals',
      diagnosis: 'Hypertension follow-up',
      followUp: '2 weeks',
      prescription: {
        medicineName: 'Losartan',
        dosage: '50mg',
        frequency: 'once daily',
        duration: '30 days',
      },
    },
  });
  assert(notes.prescriptionId, 'Digital Rx should be created');
  console.log('FR-13 OK');

  const rated = await request(`/family/sessions/${sessionId}/rate`, {
    method: 'POST',
    token: familyToken,
    body: { score: 5, review: 'Clear and helpful consult' },
  });
  assert(rated.rating?.score === 5, 'Rating score should save');

  const avg = await request('/doctor/rating', { token: doctorToken });
  assert(avg.count >= 1, 'Doctor average rating should update');
  console.log('FR-15 OK');

  console.log('FR-12 / FR-13 / FR-15 test passed');
}

run().catch((err) => {
  console.error('FR-12 / FR-13 / FR-15 test failed:', err.message);
  process.exit(1);
});
