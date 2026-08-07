import { Router } from 'express';
import {
  listPendingAssignments,
  respondToCarePlan,
} from '../controllers/familyCarePlanController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('caregiver'));

router.get('/assignments/pending', listPendingAssignments);
router.post('/assignments/:id/respond', respondToCarePlan);

export default router;
