// routes/billRoutes.js
import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import * as billController from '../controllers/billController.js';

const router = express.Router();

// 1. Generate/Create a New Bill (Used by Receptionist)
router.post(
    '/',
    protect,
    restrictTo('Receptionist'),
    billController.createBill
);

// 2. Get All Bills (Used by Receptionist Manager/Admin reporting)
router.get(
    '/',
    protect,
    restrictTo('Receptionist', 'Admin'),
    billController.getAllBills
);

// 3. Update Bill Status (e.g., mark as 'Paid', used by Receptionist)
router.put(
    '/:id/status',
    protect,
    restrictTo('Receptionist'),
    billController.updateBillStatus
);

// 4. Get Billing History for a specific Patient (Used by PatientProfile)
router.get(
    '/patient/:id',
    protect,
    restrictTo('Doctor', 'Receptionist', 'Admin'),
    billController.getBillsByPatient
);

export default router;