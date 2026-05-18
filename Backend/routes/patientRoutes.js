// backend/routes/patientRoutes.js
import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import * as patientController from '../controllers/patientController.js';

const router = express.Router();

// Get all patients
router.get('/', protect, restrictTo('Doctor', 'Receptionist', 'Admin'), patientController.getAllPatients);

// Register new patient
router.post('/', protect, restrictTo('Receptionist'), patientController.createPatient);

// Get patient by ID
router.get('/:id', protect, restrictTo('Doctor', 'Receptionist', 'Admin'), patientController.getPatientById);

// Update patient
router.put('/:id', protect, restrictTo('Receptionist'), patientController.updatePatient);

// Delete patient
router.delete('/:id', protect, restrictTo('Receptionist'), patientController.deletePatient);

// ✅ New route: Get total patients (for Admin Dashboard)
router.get('/total', protect, restrictTo('Admin'), patientController.getTotalPatients);

export default router;
