import 'dotenv/config';
import { geocodeAddress } from '../utils/geocode.js';

async function run() {
  console.log('Geocode test starting...');
  const result = await geocodeAddress('Mirpur 10, Dhaka, Bangladesh');
  if (Number.isNaN(result.latitude) || Number.isNaN(result.longitude)) {
    throw new Error('Invalid coordinates returned');
  }
  console.log('Matched:', result.displayName);
  console.log('Lat/Lng:', result.latitude, result.longitude);
  console.log('Geocode test passed');
}

run().catch((err) => {
  console.error('Geocode test failed:', err.message);
  process.exit(1);
});
