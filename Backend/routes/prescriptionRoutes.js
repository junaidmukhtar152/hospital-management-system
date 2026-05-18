// routes/prescriptionRoutes.js
import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import * as prescriptionController from '../controllers/prescriptionController.js';

const router = express.Router();

// 1. Create a New Prescription (Used by Doctor in consultation)
router.post(
    '/',
    protect,
    restrictTo('Doctor'),
    prescriptionController.createPrescription
);

// 2. Get Prescription History for a specific Patient (Used by PatientProfile)
router.get(
    '/patient/:id',
    protect,
    restrictTo('Doctor', 'Receptionist', 'Admin'), // Read access for multiple roles
    prescriptionController.getPrescriptionsByPatient
);

router.delete(
    '/:id',
    protect,
    restrictTo('Doctor', 'Receptionist', 'Admin'), // Read access for multiple roles
    prescriptionController.deletePrescription
);



export default router;