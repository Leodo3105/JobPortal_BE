import express from 'express';
import {
  getCurrentProfile,
  createOrUpdateProfile,
  addEducation,
  deleteEducation,
  addExperience,
  deleteExperience,
  getAllProfiles,
  getProfileById,
  deleteProfile,
  uploadAvatar,   
  resetAvatar,    
  getAvatar
} from '../../controllers/jobseeker/profileController.js';
import { protect, authorize } from '../../middlewares/auth.js';
import avatarUpload from '../../middlewares/uploads/avatarUpload.js';

const router = express.Router();

// Base route - /api/profiles
router.route('/')
  .get(protect, getCurrentProfile)
  .post(protect, authorize('jobseeker'), createOrUpdateProfile)
  .put(protect, authorize('jobseeker'), createOrUpdateProfile)
  .delete(protect, deleteProfile);

router.get('/all', getAllProfiles);
router.get('/user/:user_id', getProfileById);

router.route('/education')
  .put(protect, authorize('jobseeker'), addEducation);

router.route('/education/:edu_id')
  .delete(protect, authorize('jobseeker'), deleteEducation);

router.route('/experience')
  .put(protect, authorize('jobseeker'), addExperience);

router.route('/experience/:exp_id')
  .delete(protect, authorize('jobseeker'), deleteExperience);

// Upload avatar
router.put('/avatar', protect, authorize('jobseeker'), avatarUpload.single('avatar'), uploadAvatar);

// Reset avatar to default
router.delete('/avatar', protect, authorize('jobseeker'), resetAvatar);

// Get avatar
router.get('/avatar/:filename', getAvatar);

export default router;