import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import { User } from '../models/User.js';
import { CaregiverVetting } from '../models/CaregiverVetting.js';

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
    verificationStatus: 'verified',
  },
  {
    name: 'Dr. Samira Akter',
    email: 'samira.doctor@eldercare.bd',
    phone: '+8801711000004',
    role: 'doctor',
    password: DEMO_PASSWORD,
  },
];

async function ensureActivatedVetting(caregiver) {
  await CaregiverVetting.create({
    caregiverId: caregiver._id,
    nidVerified: true,
    nidNumber: '1990123456789',
    nidVerifiedAt: new Date(),
    policeClearance: true,
    policeDocumentUrl: 'https://example.local/demo-police-clearance.pdf',
    policeReviewedAt: new Date(),
    referenceCheck: true,
    references: [
      {
        name: 'Ward Councilor Alam',
        relation: 'Ward councilor',
        note: 'Known locally for 5 years',
        verified: true,
      },
      {
        name: 'City Clinic HR',
        relation: 'Institution',
        note: 'Prior volunteer work',
        verified: true,
      },
    ],
    referencesReviewedAt: new Date(),
    probationStatus: 'passed',
    probationNote: 'Demo seed activation',
    probationReviewedAt: new Date(),
    status: 'activated',
    activatedAt: new Date(),
    notes: 'Seeded activated caregiver for local demos',
  });
}

async function reset() {
  await connectDB();

  const dbName = mongoose.connection.name;
  await mongoose.connection.dropDatabase();
  console.log(`Dropped database: ${dbName}`);

  for (const data of demoUsers) {
    const user = await User.create(data);
    console.log(`Created: ${data.email} (${data.role})`);
    if (data.role === 'caregiver') {
      await ensureActivatedVetting(user);
    }
  }

  console.log('\nDatabase reset complete.');
  console.log('Demo login password for all accounts:', DEMO_PASSWORD);
  await mongoose.disconnect();
}

reset().catch((err) => {
  console.error('Reset failed:', err.message);
  process.exit(1);
});
