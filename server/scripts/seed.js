import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import { User } from '../models/User.js';

const DEMO_PASSWORD = '12345678';

const demoUsers = [
  {
    name: 'Karim Hassan',
    email: 'karim.admin@eldercare.bd',
    phone: '+8801711000001',
    role: 'admin',
    password: DEMO_PASSWORD,
  },
  {
    name: 'Nusrat Jahan',
    email: 'nusrat.family@eldercare.bd',
    phone: '+8801711000002',
    role: 'family',
    password: DEMO_PASSWORD,
  },
  {
    name: 'Rafiqul Islam',
    email: 'rafiq.caregiver@eldercare.bd',
    phone: '+8801711000003',
    role: 'caregiver',
    password: DEMO_PASSWORD,
  },
  {
    name: 'Dr. Samira Akter',
    email: 'samira.doctor@eldercare.bd',
    phone: '+8801711000004',
    role: 'doctor',
    password: DEMO_PASSWORD,
  },
];

async function seed() {
  await connectDB();

  for (const data of demoUsers) {
    const exists = await User.findOne({ email: data.email });
    if (exists) {
      exists.password = DEMO_PASSWORD;
      await exists.save();
      console.log(`Updated password: ${data.email} (${data.role})`);
      continue;
    }
    await User.create(data);
    console.log(`Created: ${data.email} (${data.role})`);
  }

  console.log('\nDemo login password for all seeded accounts:', DEMO_PASSWORD);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
