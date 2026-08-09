import { Router } from 'express';
import { getSharedDocument } from '../controllers/vaultController.js';

const router = Router();

router.get('/shared/:token', getSharedDocument);

export default router;
