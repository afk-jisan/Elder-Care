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
  console.log('FR-05 test starting...');
  const familyToken = await login('nusrat.family@eldercare.bd', '12345678');
  const caregiverToken = await login(
    'rafiq.caregiver@eldercare.bd',
    '12345678'
  );

  const existingVisit = await request('/caregiver/visits/active', {
    token: caregiverToken,
  });
  if (existingVisit.visit) {
    const elder = existingVisit.visit.elder;
    await request('/caregiver/check-out', {
      method: 'POST',
      token: caregiverToken,
      body: {
        latitude: elder?.latitude ?? 23.79371,
        longitude: elder?.longitude ?? 90.40661,
        photoUrl: 'data:image/png;base64,preclear',
      },
    });
  }

  const elderRes = await request('/family/elders', {
    method: 'POST',
    token: familyToken,
    body: {
      name: 'Task Elder',
      address: 'Banani, Dhaka',
      latitude: 23.7937,
      longitude: 90.4066,
    },
  });
  const elderId = elderRes.elder.id;

  const caregivers = await request('/family/caregivers', { token: familyToken });
  const caregiver = caregivers.caregivers.find(
    (c) => c.email === 'rafiq.caregiver@eldercare.bd'
  );
  assert(caregiver, 'Seed caregiver missing from vetted pool');

  const plan = await request('/family/care-plans', {
    method: 'POST',
    token: familyToken,
    body: {
      elderId,
      package: 'Companion',
      caregiverId: caregiver.id,
    },
  });

  await request(`/caregiver/assignments/${plan.carePlan.id}/respond`, {
    method: 'POST',
    token: caregiverToken,
    body: { decision: 'accept' },
  });

  const created = await request('/family/tasks', {
    method: 'POST',
    token: familyToken,
    body: {
      carePlanId: plan.carePlan.id,
      type: 'companion_visit',
      title: 'Morning companion visit',
      scheduledTime: new Date().toISOString(),
      completionMethod: 'note',
    },
  });
  const taskId = created.task.id;
  console.log('Created task:', taskId);

  let blocked = false;
  try {
    await request(`/caregiver/tasks/${taskId}/complete`, {
      method: 'POST',
      token: caregiverToken,
      body: { completionNote: 'Done without check-in' },
    });
  } catch {
    blocked = true;
  }
  assert(blocked, 'Expected complete without check-in to fail');
  console.log('Complete without check-in correctly blocked');

  await request('/caregiver/check-in', {
    method: 'POST',
    token: caregiverToken,
    body: {
      elderId,
      latitude: 23.7937,
      longitude: 90.4066,
    },
  });
  console.log('Checked in');

  const completed = await request(`/caregiver/tasks/${taskId}/complete`, {
    method: 'POST',
    token: caregiverToken,
    body: { completionNote: 'Visited and talked with elder' },
  });
  assert(completed.task.status === 'completed', 'Expected completed status');
  console.log('Task completed');

  let locked = false;
  try {
    await request(`/caregiver/tasks/${taskId}/complete`, {
      method: 'POST',
      token: caregiverToken,
      body: { completionNote: 'Try again' },
    });
  } catch {
    locked = true;
  }
  assert(locked, 'Expected completed task to be locked');
  console.log('Completed task is locked');

  const listed = await request('/caregiver/tasks?status=completed', {
    token: caregiverToken,
  });
  assert(
    listed.tasks.some((t) => t.id === taskId),
    'Completed task should appear in filtered list'
  );

  await request('/caregiver/check-out', {
    method: 'POST',
    token: caregiverToken,
    body: {
      latitude: 23.79371,
      longitude: 90.40661,
      photoUrl: 'data:image/png;base64,taskcomplete',
    },
  });

  console.log('FR-05 test passed');
}

run().catch((err) => {
  console.error('FR-05 test failed:', err.message);
  process.exit(1);
});
