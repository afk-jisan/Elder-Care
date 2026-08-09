import { Router } from 'express';
import {
  listAssignedElders,
  listVisits,
  getActiveVisit,
  checkIn,
  checkOut,
} from '../controllers/caregiverCheckInController.js';
import {
  listPendingAssignments,
  respondToCarePlan,
} from '../controllers/familyCarePlanController.js';
import {
  listCaregiverTasks,
  completeTask,
} from '../controllers/caregiverTaskController.js';
import {
  createVitalsLog,
  listCaregiverVitals,
} from '../controllers/vitalsController.js';
import {
  uploadPrescription,
  listCaregiverPrescriptions,
} from '../controllers/prescriptionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('caregiver'));

router.get('/assignments/pending', listPendingAssignments);
router.post('/assignments/:id/respond', respondToCarePlan);
router.get('/assignments/active', listAssignedElders);
router.get('/visits', listVisits);
router.get('/visits/active', getActiveVisit);
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/tasks', listCaregiverTasks);
router.post('/tasks/:id/complete', completeTask);
router.get('/vitals', listCaregiverVitals);
router.post('/vitals', createVitalsLog);
router.get('/prescriptions', listCaregiverPrescriptions);
router.post('/prescriptions', uploadPrescription);

export default router;
