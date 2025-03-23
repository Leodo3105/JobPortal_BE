import express from 'express';
import {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  getEmployerJobs,
  changeJobStatus,
  getSimilarJobs
} from '../../controllers/job/jobController.js';
import { protect, authorize } from '../../middlewares/auth.js';

const router = express.Router();

// Base routes
router.route('/')
  .get(getJobs)
  .post(protect, authorize('employer', 'admin'), createJob);

router.route('/:id')
  .get(getJob)
  .put(protect, authorize('employer', 'admin'), updateJob)
  .delete(protect, authorize('employer', 'admin'), deleteJob);

// Get similar jobs
router.get('/:id/similar', getSimilarJobs);

// Get employer's jobs
router.get('/employer/myjobs', protect, authorize('employer'), getEmployerJobs);

// Change job status
router.put('/:id/status', protect, authorize('employer', 'admin'), changeJobStatus);

export default router;