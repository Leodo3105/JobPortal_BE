import express from 'express';
import {
  createOrUpdateCompany,
  getCompanyProfile,
  getAllCompanies,
  getCompanyById,
  uploadLogo,
  getCompanyLogo
} from '../../controllers/employer/companyController.js';
import { protect, authorize } from '../../middlewares/auth.js';
import logoUpload from '../../middlewares/uploads/logoUpload.js';

const router = express.Router();

// Base routes
router.route('/')
  .get(protect, authorize('employer'), getCompanyProfile)
  .post(protect, authorize('employer'), createOrUpdateCompany)
  .put(protect, authorize('employer'), createOrUpdateCompany);

// Get all companies
router.get('/all', getAllCompanies);

// Get company by ID
router.get('/:id', getCompanyById);

// Upload company logo
router.put('/logo', 
  protect, 
  authorize('employer'), 
  logoUpload.single('logo'), 
  uploadLogo
);

// Get company logo
router.get('/logo/:filename', getCompanyLogo);

export default router;