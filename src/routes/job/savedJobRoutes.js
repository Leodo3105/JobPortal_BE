import express from 'express';
import { 
  saveJob, 
  unsaveJob, 
  getSavedJobs 
} from '../../controllers/job/savedJobController.js';
import { protect, authorize } from '../../middlewares/auth.js';

const router = express.Router();

// Save a job
router.post('/:jobId', protect, authorize('jobseeker'), saveJob);

// Unsave a job
router.delete('/:jobId', protect, authorize('jobseeker'), unsaveJob);

// Get user's saved jobs
router.get('/', protect, authorize('jobseeker'), getSavedJobs);

export default router;
