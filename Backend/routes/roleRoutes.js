// backend/routes/roleRoutes.js
import express from 'express';
import { getRoles, createRole, updateRole } from '../controllers/roleController.js';
const router = express.Router();

router.get('/', getRoles);
router.post('/', createRole);
router.put('/:id', updateRole);

export default router;
