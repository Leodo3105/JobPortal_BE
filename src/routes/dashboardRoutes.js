// src/routes/dashboardRoutes.js
import express from 'express';
import { 
  getDashboard, 
  getAdminDashboard, 
  getEmployerDashboard, 
  getJobseekerDashboard 
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Chung - tự động chọn dashboard dựa vào vai trò người dùng
router.get('/', protect, getDashboard);

// Routes cụ thể cho từng vai trò (nếu cần)
router.get('/admin', protect, authorize('admin'), getAdminDashboard);
router.get('/employer', protect, authorize('employer'), getEmployerDashboard);
router.get('/jobseeker', protect, authorize('jobseeker'), getJobseekerDashboard);

export default router;