import { Router } from 'express';
import { geocodeAddress } from '../utils/geocode.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/lookup', async (req, res, next) => {
  try {
    const { address } = req.body;
    const result = await geocodeAddress(address);
    res.json({
      message: 'Location found',
      ...result,
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
});

export default router;
