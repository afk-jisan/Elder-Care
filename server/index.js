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
import geoRoutes from './routes/geoRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));

app.get('/', (req, res) => {
  res.send('Elder Care API');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/vetting', adminVettingRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/caregiver', caregiverRoutes);
app.use('/api/doctor/availability', doctorAvailabilityRoutes);
app.use('/api/geo', geoRoutes);
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
