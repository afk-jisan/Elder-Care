import { Router } from 'express';
import {
  listAssignedElders,
  listVisits,
  getActiveVisit,
  checkIn,
  checkOut,
} from '../controllers/caregiverCheckInController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('caregiver'));

router.get('/assignments/active', listAssignedElders);
router.get('/visits', listVisits);
router.get('/visits/active', getActiveVisit);
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);

export default router;
