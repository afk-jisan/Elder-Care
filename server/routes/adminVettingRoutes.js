import { Router } from 'express';
import {
  listVetting,
  listUnvettedCaregivers,
  startVetting,
  updateNid,
  updatePolice,
  updateReferences,
  updateProbation,
  activateVetting,
  rejectVetting,
} from '../controllers/adminVettingController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', listVetting);
router.get('/caregivers/unvetted', listUnvettedCaregivers);
router.post('/:caregiverId/start', startVetting);
router.patch('/:id/nid', updateNid);
router.patch('/:id/police', updatePolice);
router.patch('/:id/references', updateReferences);
router.patch('/:id/probation', updateProbation);
router.post('/:id/activate', activateVetting);
router.post('/:id/reject', rejectVetting);

export default router;
