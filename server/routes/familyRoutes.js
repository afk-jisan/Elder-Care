import { Router } from 'express';
import {
  listElders,
  createElder,
  listCaregivers,
  listCarePlans,
  createCarePlan,
  assignCaregiver,
} from '../controllers/familyCarePlanController.js';
import {
  createFamilyTask,
  listFamilyTasks,
} from '../controllers/caregiverTaskController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('family'));

router.get('/elders', listElders);
router.post('/elders', createElder);
router.get('/caregivers', listCaregivers);
router.get('/care-plans', listCarePlans);
router.post('/care-plans', createCarePlan);
router.post('/care-plans/:id/assign', assignCaregiver);
router.get('/tasks', listFamilyTasks);
router.post('/tasks', createFamilyTask);

export default router;
