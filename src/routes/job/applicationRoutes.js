import express from 'express';
import {
  applyForJob,
  getJobApplications,
  getApplicationDetails,
  updateApplicationStatus,
  scheduleInterview,
  getApplicationCV,
  getUserApplications,
  addApplicationNote
} from '../../controllers/job/applicationController.js';
import { protect, authorize } from '../../middlewares/auth.js';
import upload from '../../middlewares/uploads/upload.js';

const router = express.Router();

// Apply for a job
router.post('/apply', 
  protect, 
  authorize('jobseeker'), 
  upload.single('cv'), 
  applyForJob
);

// Get all applications for a job
router.get('/job/:jobId', 
  protect, 
  authorize('employer', 'admin'), 
  getJobApplications
);

// Get application details
router.get('/:id', 
  protect, 
  getApplicationDetails
);

// Update application status
router.put('/:id/status', 
  protect, 
  authorize('employer', 'admin'), 
  updateApplicationStatus
);

// Schedule an interview
router.put('/:id/schedule-interview', 
  protect, 
  authorize('employer', 'admin'), 
  scheduleInterview
);

// Get application CV
router.get('/:id/cv', 
  protect, 
  getApplicationCV
);

// Get user's applications
router.get('/user/myapplications', 
  protect, 
  authorize('jobseeker'), 
  getUserApplications
);

// Add note to application
router.put('/:id/notes', 
  protect, 
  authorize('employer', 'admin'), 
  addApplicationNote
);

export default router;