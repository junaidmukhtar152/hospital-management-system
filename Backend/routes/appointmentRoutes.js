// backend/routes/appointmentRoutes.js
import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import * as appointmentController from "../controllers/appointmentController.js";

const router = express.Router();

// Create Appointment (Receptionist)
router.post(
  "/",
  protect,
  restrictTo("Receptionist"),
  appointmentController.createAppointment
);

// Get All Appointments (Admin + Receptionist + Doctor)
router.get(
  "/",
  protect,
  restrictTo("Receptionist", "Admin", "Doctor"),
  appointmentController.getAllAppointments
);

// Get Doctor Appointments (Doctor + Admin)
router.get(
  "/doctor/:id",
  protect,
  restrictTo("Doctor", "Admin"),
  appointmentController.getAppointmentsByDoctor
);

// Update Appointment (Receptionist)
router.put(
  "/:id",
  protect,
  restrictTo("Receptionist"),
  appointmentController.updateAppointment
);

router.put(
  "/cancel/:id",
  protect,
  restrictTo("Receptionist", "Admin"),
  appointmentController.cancelAppointment
);
// Delete / Cancel Appointment (Receptionist)

router.delete(
  "/:id",
  protect,
  restrictTo("Receptionist", "Admin" , 'Doctor'),
  appointmentController.deleteAppointment
);

// ✅ New route: Get total appointments (all time)
router.get(
  "/total",
  protect,
  restrictTo("Receptionist", "Admin"),
  appointmentController.getTotalAppointments
);

 router.put(
  "/:id/status",
  protect,
  restrictTo("Receptionist", "Doctor"),
  appointmentController.updateAppointmentStatus
);

export default router;
