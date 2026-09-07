import 'dotenv/config';

const BASE =
  process.env.API_URL ||
  'https://aware-reprieve-production-7023.up.railway.app/api';
const PASSWORD = '12345678';

const USERS = {
  admin: 'karim.admin@eldercare.bd',
  family: 'nusrat.family@eldercare.bd',
  caregiver: 'rafiq.caregiver@eldercare.bd',
  doctor: 'samira.doctor@eldercare.bd',
};

const results = [];

async function request(path, { method = 'GET', token, body, expectOk = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  const ok = expectOk ? res.ok : true;
  results.push({
    method,
    path,
    status: res.status,
    ok: res.ok,
    pass: ok,
    message: data.message || '',
  });
  if (!ok) {
    const err = new Error(`${method} ${path} -> ${res.status} ${data.message || ''}`);
    err.result = results[results.length - 1];
    throw err;
  }
  return data;
}

async function login(email) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: { email, password: PASSWORD },
  });
  return data.token;
}

async function testPublic() {
  await request('/health');
}

async function testAuth(tokens) {
  for (const [role, token] of Object.entries(tokens)) {
    await request('/auth/me', { token });
    results.push({
      method: 'GET',
      path: `/auth/me (${role})`,
      status: 200,
      ok: true,
      pass: true,
      message: 'ok',
    });
  }
}

async function testFamily(token) {
  const paths = [
    '/family/elders',
    '/family/caregivers',
    '/family/care-plans',
    '/family/tasks',
    '/family/vitals',
    '/family/feed',
    '/family/prescriptions',
    '/family/vault',
    '/family/wallet',
    '/family/utilities',
    '/family/sessions',
  ];
  for (const path of paths) {
    await request(path, { token });
  }
}

async function testCaregiver(token) {
  const paths = [
    '/caregiver/assignments/pending',
    '/caregiver/assignments/active',
    '/caregiver/visits',
    '/caregiver/visits/active',
    '/caregiver/tasks',
    '/caregiver/vitals',
    '/caregiver/prescriptions',
    '/caregiver/doctors/available',
    '/caregiver/sessions',
    '/caregiver/payments',
  ];
  for (const path of paths) {
    await request(path, { token });
  }
}

async function testDoctor(token) {
  const paths = [
    '/doctor/availability',
    '/doctor/sessions',
    '/doctor/prescriptions',
    '/doctor/rating',
  ];
  for (const path of paths) {
    await request(path, { token });
  }
}

async function testAdmin(token) {
  const paths = [
    '/admin/users',
    '/admin/vetting',
    '/admin/vetting/caregivers/unvetted',
    '/admin/disputes',
    '/admin/sos',
    '/admin/analytics',
  ];
  for (const path of paths) {
    await request(path, { token });
  }
}

async function testGeo(token) {
  await request('/geo/reverse', {
    method: 'POST',
    token,
    body: { latitude: 23.8103, longitude: 90.4125 },
  });
}

async function run() {
  console.log(`Railway endpoint smoke test\nBase: ${BASE}\n`);

  const tokens = {};
  const steps = [
    ['public health', () => testPublic()],
    ['logins', async () => {
      for (const [role, email] of Object.entries(USERS)) {
        tokens[role] = await login(email);
      }
    }],
    ['auth/me', () => testAuth(tokens)],
    ['family', () => testFamily(tokens.family)],
    ['caregiver', () => testCaregiver(tokens.caregiver)],
    ['doctor', () => testDoctor(tokens.doctor)],
    ['admin', () => testAdmin(tokens.admin)],
    ['geo', () => testGeo(tokens.family)],
  ];

  for (const [name, fn] of steps) {
    try {
      await fn();
      console.log(`OK  ${name}`);
    } catch (err) {
      console.error(`ERR ${name}: ${err.message}`);
    }
  }

  const failed = results.filter((r) => !r.pass);
  console.log('Endpoint results:');
  for (const r of results) {
    const mark = r.pass ? 'PASS' : 'FAIL';
    console.log(`${mark} ${r.method.padEnd(4)} ${r.status} ${r.path}`);
  }

  console.log(`\nTotal: ${results.length}, Passed: ${results.length - failed.length}, Failed: ${failed.length}`);
  if (failed.length) {
    process.exit(1);
  }
  console.log('\nAll tested endpoints OK.');
}

run().catch((err) => {
  console.error('\nSmoke test failed:', err.message);
  const failed = results.filter((r) => !r.pass);
  if (failed.length) {
    for (const r of failed) {
      console.error(`FAIL ${r.method} ${r.path} -> ${r.status} ${r.message}`);
    }
  }
  process.exit(1);
});
