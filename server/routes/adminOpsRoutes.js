import { Router } from 'express';
import {
  listDisputes,
  resolveDispute,
  listSos,
  escalateSos,
  resolveSos,
  getAnalytics,
} from '../controllers/adminOpsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/disputes', listDisputes);
router.post('/disputes/:id/resolve', resolveDispute);
router.get('/sos', listSos);
router.post('/sos/:id/escalate', escalateSos);
router.post('/sos/:id/resolve', resolveSos);
router.get('/analytics', getAnalytics);

export default router;
