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
import { listFamilyVitals } from '../controllers/vitalsController.js';
import { getCareStatusFeed } from '../controllers/careFeedController.js';
import { listFamilyPrescriptions } from '../controllers/prescriptionController.js';
import {
  listVaultDocuments,
  uploadVaultDocument,
  createShareLink,
} from '../controllers/vaultController.js';
import {
  getWallet,
  updateWalletBudget,
  loadWallet,
  releasePayment,
  confirmReleaseOtp,
} from '../controllers/walletController.js';
import {
  listUtilityBills,
  createUtilityBill,
  payUtilityBill,
} from '../controllers/utilityBillController.js';
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
router.get('/vitals', listFamilyVitals);
router.get('/feed', getCareStatusFeed);
router.get('/prescriptions', listFamilyPrescriptions);
router.get('/vault', listVaultDocuments);
router.post('/vault', uploadVaultDocument);
router.post('/vault/:id/share', createShareLink);
router.get('/wallet', getWallet);
router.patch('/wallet', updateWalletBudget);
router.post('/wallet/load', loadWallet);
router.post('/wallet/release', releasePayment);
router.post('/wallet/payments/:id/confirm-otp', confirmReleaseOtp);
router.get('/utilities', listUtilityBills);
router.post('/utilities', createUtilityBill);
router.post('/utilities/:id/pay', payUtilityBill);

export default router;
