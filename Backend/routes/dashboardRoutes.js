// D:/WebProjects/Hospital-Management-System/Backend/routes/dashboardRoutes.js

import express from 'express';
import {
    getAdminDashboardStats,
    getReceptionistDashboardStats,
    getDoctorDashboardStats,
    getDoctorAppointments, 
    
} from '../controllers/dashboardController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================
// Admin dashboard
// ============================
router.get('/admin', protect, restrictTo('Admin'), getAdminDashboardStats);

// ============================
// Receptionist dashboard
// ============================
router.get('/receptionist', protect, restrictTo('Receptionist'), getReceptionistDashboardStats);

// ============================
// Doctor dashboard (Stats)
// ============================
// Frontend calls: /api/v1/doctor
router.get('/doctor', protect, restrictTo('Doctor'), getDoctorDashboardStats);

// 🟢 DOCTOR APPOINTMENTS LIST
// Frontend calls: /api/v1/appointments/doctor
router.get('/appointments/doctor', protect, restrictTo('Doctor'), getDoctorAppointments);


// ============================
// System logs
// ============================


export default router;