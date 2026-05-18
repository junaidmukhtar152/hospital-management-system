// routes/reportRoutes.js
import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
    getReportsByPatient,
    createTestReport,
    deleteTestReport
} from '../controllers/reportController.js';

const router = express.Router();

// 1. Get Report History for a specific Patient (Used by PatientProfile)
router.get(
    '/patient/:id',
    protect,
    restrictTo('Doctor', 'Receptionist', 'Admin'),
    getReportsByPatient
);

// 2. Create/Log a New Test Report (Used by Lab/Admin to record a result)
router.post(
    '/',
    protect,
    restrictTo('Doctor', 'Admin'), // Allow Doctor and Admin to create
    createTestReport
);

// 3. Delete a Test Report
router.delete(
    '/:reportId',
    protect,
    restrictTo('Doctor', 'Admin'),
    deleteTestReport
);

export default router;