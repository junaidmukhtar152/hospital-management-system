// routes/roomRoutes.js
import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import * as roomController from '../controllers/roomController.js';

const router = express.Router();

// Get all rooms
router.get('/', protect, restrictTo('Receptionist', 'Admin'), roomController.getAllRooms);

// Assign a patient to a room
router.post('/assign', protect, restrictTo('Receptionist'), roomController.createRoomAssignment);

// Discharge a patient from a room
router.put('/discharge/:roomId', protect, restrictTo('Receptionist'), roomController.dischargePatient);

// Update room status (Available / Occupied / Maintenance)
router.put('/:roomId/status', protect, restrictTo('Admin'), roomController.updateRoomStatus);

// Add new room
router.post('/', protect, restrictTo('Admin'), roomController.createRoom);

// Update room info (edit Room_Type or Status)
router.put('/:roomId', protect, restrictTo('Admin'), roomController.updateRoom);

// Delete room
router.delete('/:roomId', protect, restrictTo('Admin'), roomController.deleteRoom);

export default router;
