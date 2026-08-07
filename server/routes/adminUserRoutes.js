import { Router } from 'express';
import {
  listUsers,
  createUser,
  updateUser,
  deactivateUser,
  reactivateUser,
} from '../controllers/adminUserController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.post('/:id/deactivate', deactivateUser);
router.post('/:id/reactivate', reactivateUser);

export default router;
