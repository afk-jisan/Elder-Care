import { Router } from 'express';
import {
  register,
  login,
  logout,
  me,
} from '../controllers/authController.js';
import { authenticate, loadUser } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, loadUser, me);

export default router;
