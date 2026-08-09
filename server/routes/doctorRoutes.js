import { Router } from 'express';
import {
  listDoctorSessions,
  respondToSession,
  endSession,
  writeSessionNotes,
  doctorAverageRating,
} from '../controllers/sessionController.js';
import { listDoctorPrescriptions } from '../controllers/prescriptionController.js';
import {
  listAvailability,
  createAvailability,
  deleteAvailability,
} from '../controllers/doctorAvailabilityController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('doctor'));

router.get('/availability', listAvailability);
router.post('/availability', createAvailability);
router.delete('/availability/:id', deleteAvailability);
router.get('/sessions', listDoctorSessions);
router.post('/sessions/:id/respond', respondToSession);
router.post('/sessions/:id/end', endSession);
router.post('/sessions/:id/notes', writeSessionNotes);
router.get('/prescriptions', listDoctorPrescriptions);
router.get('/rating', doctorAverageRating);

export default router;
