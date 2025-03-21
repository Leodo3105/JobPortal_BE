import express from 'express';
import { uploadCV, deleteCV, getCV } from '../../controllers/jobseeker/cvController.js';
import { protect, authorize } from '../../middlewares/auth.js';
import upload from '../../middlewares/uploads/upload.js';

const router = express.Router();

// Upload CV
router.put('/upload', protect, authorize('jobseeker'), upload.single('cv'), uploadCV);

// Delete CV
router.delete('/', protect, authorize('jobseeker'), deleteCV);

// Get CV
router.get('/:filename', protect, getCV);

export default router;