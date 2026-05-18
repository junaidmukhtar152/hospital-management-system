import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import * as employeeController from '../controllers/employeeController.js';

const router = express.Router();

// --- Roles ---
// Any authenticated user can fetch roles (needed for dropdowns)
router.get('/roles', protect, employeeController.getAllRoles);

// --- Employees ---
// Create Employee (Admin only)
router.post('/', protect, restrictTo('Admin'), employeeController.createEmployee);

// Get All Employees
// Admin can see all employees, Receptionist can fetch only doctors (for appointment form)
router.get('/', protect, employeeController.getEmployeesByRoleOrAll);

// Update Employee (Admin only)
router.put('/:id', protect, restrictTo('Admin'), employeeController.updateEmployee);

// Delete Employee (Admin only)
router.delete('/:id', protect, restrictTo('Admin'), employeeController.deleteEmployee);

router.get('/:id', protect, restrictTo('Doctor'), employeeController.getEmployeeById);



export default router;
