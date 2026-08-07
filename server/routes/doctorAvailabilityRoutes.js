import { Router } from 'express';
import {
  listAvailability,
  createAvailability,
  deleteAvailability,
} from '../controllers/doctorAvailabilityController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('doctor'));

router.get('/', listAvailability);
router.post('/', createAvailability);
router.delete('/:id', deleteAvailability);

export default router;
