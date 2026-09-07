import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';
import adminVettingRoutes from './routes/adminVettingRoutes.js';
import familyRoutes from './routes/familyRoutes.js';
import caregiverRoutes from './routes/caregiverRoutes.js';
import doctorAvailabilityRoutes from './routes/doctorAvailabilityRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import adminOpsRoutes from './routes/adminOpsRoutes.js';
import geoRoutes from './routes/geoRoutes.js';
import vaultPublicRoutes from './routes/vaultPublicRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { UPLOADS_DIR } from './utils/imgbb.js';

const app = express();
const port = process.env.PORT || 5000;
const clientUrl =
  process.env.CLIENT_URL || 'https://eldercare-4mg.pages.dev';

function apiWelcomeHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Elder Care API</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 32rem; margin: 3rem auto; padding: 0 1rem; color: #1a1a1a; line-height: 1.5; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { margin: 0.75rem 0; }
    a { color: #2563eb; }
    .box { background: #f4f6f8; border-radius: 8px; padding: 1rem; margin-top: 1rem; }
  </style>
</head>
<body>
  <h1>Elder Care API</h1>
  <p>The backend service is running.</p>
  <p>This link is for the API server only. It does not show the app screens.</p>
  <div class="box">
    <p><strong>Open the website:</strong><br /><a href="${clientUrl}">${clientUrl}</a></p>
    <p><strong>Health check:</strong><br /><a href="/api/health">/api/health</a></p>
  </div>
</body>
</html>`;
}

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '8mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

app.get('/', (req, res) => {
  res.redirect('/api');
});

app.get('/api', (req, res) => {
  if (req.accepts(['html', 'json']) === 'json') {
    return res.json({
      message: 'Elder Care API is running.',
      hint: 'Open the website to log in and use dashboards.',
      frontend: clientUrl,
      health: '/api/health',
    });
  }
  res.type('html').send(apiWelcomeHtml());
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/vetting', adminVettingRoutes);
app.use('/api/admin', adminOpsRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/caregiver', caregiverRoutes);
app.use('/api/doctor/availability', doctorAvailabilityRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/vault', vaultPublicRoutes);

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      message: 'This API route was not found.',
      hint: 'Check the path or open the Elder Care website to use the app.',
      frontend: clientUrl,
    });
  }
  res.status(404).type('html').send(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>Page not found</title></head>
<body style="font-family:system-ui,sans-serif;max-width:32rem;margin:3rem auto;padding:0 1rem;line-height:1.5;">
  <h1>Page not found</h1>
  <p>This server hosts the Elder Care API.</p>
  <p><a href="${clientUrl}">Open the Elder Care website</a></p>
</body>
</html>`);
});

app.use(errorHandler);

async function start() {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
