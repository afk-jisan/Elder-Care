import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'srs-screenshots');
const BASE = process.env.SRS_BASE_URL || 'https://eldercare-4mg.pages.dev';
const PASSWORD = '12345678';

const ROLE_CAPTURES = [
  {
    email: 'rafiq.caregiver@eldercare.bd',
    shots: [
      { path: '/caregiver/check-in', file: 'fr-01-check-in.png' },
      { path: '/caregiver/video', file: 'fr-02-video-session.png' },
      { path: '/caregiver/prescriptions', file: 'fr-03-prescription-upload.png' },
      { path: '/caregiver/vitals', file: 'fr-04-vitals.png' },
      { path: '/caregiver/tasks', file: 'fr-05-tasks.png' },
    ],
  },
  {
    email: 'nusrat.family@eldercare.bd',
    shots: [
      { path: '/family/care-plan', file: 'fr-06-care-plan.png' },
      { path: '/family/wallet', file: 'fr-07-wallet.png' },
      { path: '/family/utilities', file: 'fr-08-utilities.png' },
      { path: '/family/vault', file: 'fr-09-vault.png' },
      { path: '/family/feed', file: 'fr-10-care-feed.png' },
    ],
  },
  {
    email: 'samira.doctor@eldercare.bd',
    shots: [
      { path: '/doctor/sessions', file: 'fr-11-doctor-video.png' },
      { path: '/doctor/prescriptions', file: 'fr-12-doctor-prescriptions.png' },
      { path: '/doctor/notes', file: 'fr-13-session-notes.png' },
      { path: '/doctor/availability', file: 'fr-14-availability.png' },
      { path: '/doctor/ratings', file: 'fr-15-ratings.png' },
    ],
  },
  {
    email: 'karim.admin@eldercare.bd',
    shots: [
      { path: '/admin/users', file: 'fr-16-users.png' },
      { path: '/admin/vetting', file: 'fr-17-vetting.png' },
      { path: '/admin/disputes', file: 'fr-18-disputes.png' },
      { path: '/admin/sos', file: 'fr-19-sos.png' },
      { path: '/admin/analytics', file: 'fr-20-analytics.png' },
    ],
  },
];

async function login(page, email) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForFunction(
    () => !window.location.pathname.includes('/login'),
    null,
    { timeout: 20000 }
  );
  await page.waitForTimeout(1500);
}

async function logout(page) {
  await page.evaluate(() => {
    sessionStorage.clear();
    localStorage.clear();
  });
}

async function captureShot(page, routePath, fileName) {
  await page.goto(`${BASE}${routePath}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const outPath = path.join(OUT_DIR, fileName);
  await page.screenshot({ path: outPath, fullPage: true });
  console.log(`Saved ${fileName}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  for (const role of ROLE_CAPTURES) {
    console.log(`Logging in as ${role.email}`);
    await login(page, role.email);
    for (const shot of role.shots) {
      await captureShot(page, shot.path, shot.file);
    }
    await logout(page);
  }

  await browser.close();
  console.log('All screenshots captured.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
