import Company from '../../models/employer/Company.js';
import User from '../../models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get current employer company profile
export const getCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user.id });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Chưa có thông tin công ty cho người dùng này'
      });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Get company profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create or update company profile
export const createOrUpdateCompany = async (req, res) => {
  try {
    const {
      name,
      description,
      website,
      industry,
      companySize,
      location,
      foundedYear,
      socialMedia,
      featured,
    } = req.body;

    // Check if name is provided
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Tên công ty là bắt buộc'
      });
    }

    // Build company object
    const companyFields = {
      user: req.user.id,
      name,
      description: description || '',
      website: website || '',
      industry: industry || '',
      companySize: companySize || '1-10',
      location: location || '',
      foundedYear: foundedYear || null,
      featured: featured !== undefined ? featured : false
    };

    // Social media links
    if (socialMedia) {
      companyFields.socialMedia = {
        facebook: socialMedia.facebook || '',
        linkedin: socialMedia.linkedin || '',
        twitter: socialMedia.twitter || ''
      };
    }

    // Check if company exists
    let company = await Company.findOne({ user: req.user.id });

    if (company) {
      // Update existing company
      company = await Company.findOneAndUpdate(
        { user: req.user.id },
        { $set: companyFields },
        { new: true }
      );
      
      return res.status(200).json({
        success: true,
        data: company,
        message: 'Thông tin công ty đã được cập nhật'
      });
    }

    // Create new company
    company = await Company.create(companyFields);

    res.status(201).json({
      success: true,
      data: company,
      message: 'Thông tin công ty đã được tạo'
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all companies
export const getAllCompanies = async (req, res) => {
  try {
    // Build query
    let query = {};
    
    // Filter by featured
    if (req.query.featured === 'true') {
      query.featured = true;
    }
    
    // Filter by industry
    if (req.query.industry) {
      query.industry = req.query.industry;
    }
    
    // Filter by location
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }
    
    // Search by name
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Company.countDocuments(query);

    // Execute query
    const companies = await Company.find(query)
      .sort({ featured: -1, name: 1 })
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: companies.length,
      pagination,
      totalPages: Math.ceil(total / limit),
      data: companies
    });
  } catch (error) {
    console.error('Get all companies error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get company by ID
export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thông tin công ty'
      });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Get company by id error:', error);
    
    // Check if error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thông tin công ty'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Upload company logo
export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng upload file ảnh'
      });
    }

    // Find the company
    const company = await Company.findOne({ user: req.user.id });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thông tin công ty'
      });
    }

    // Delete old logo if it's not the default
    if (company.logo !== 'default-company-logo.png') {
      const oldLogoPath = path.join(__dirname, '../../../uploads/logos', company.logo);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }

    // Update logo
    company.logo = req.file.filename;
    await company.save();

    res.status(200).json({
      success: true,
      data: {
        logo: req.file.filename,
        logoUrl: `/uploads/logos/${req.file.filename}`
      },
      message: 'Logo đã được cập nhật'
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get company logo
export const getCompanyLogo = async (req, res) => {
  try {
    const filename = req.params.filename;
    
    // If default logo, serve from static folder
    if (filename === 'default-company-logo.png') {
      return res.sendFile(path.join(__dirname, '../../../uploads/logos/default-company-logo.png'));
    }
    
    const logoPath = path.join(__dirname, '../../../uploads/logos', filename);
    
    if (!fs.existsSync(logoPath)) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy logo'
      });
    }
    
    res.sendFile(logoPath);
  } catch (error) {
    console.error('Get logo error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get company stats
export const getCompanyStats = async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user.id });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thông tin công ty'
      });
    }

    // Get job statistics
    const jobCount = await Job.countDocuments({ company: company._id });
    const activeJobCount = await Job.countDocuments({ company: company._id, status: 'active' });
    
    // Get application statistics
    const applicationCount = await Application.countDocuments({ 
      job: { $in: await Job.find({ company: company._id }).select('_id') } 
    });
    
    const pendingApplicationCount = await Application.countDocuments({ 
      job: { $in: await Job.find({ company: company._id }).select('_id') },
      status: 'pending'
    });
    
    const acceptedApplicationCount = await Application.countDocuments({ 
      job: { $in: await Job.find({ company: company._id }).select('_id') },
      status: 'accepted'
    });
    
    const rejectedApplicationCount = await Application.countDocuments({ 
      job: { $in: await Job.find({ company: company._id }).select('_id') },
      status: 'rejected'
    });
    
    const interviewApplicationCount = await Application.countDocuments({ 
      job: { $in: await Job.find({ company: company._id }).select('_id') },
      status: 'interview'
    });

    res.status(200).json({
      success: true,
      data: {
        jobStats: {
          total: jobCount,
          active: activeJobCount,
          closed: jobCount - activeJobCount
        },
        applicationStats: {
          total: applicationCount,
          pending: pendingApplicationCount,
          interview: interviewApplicationCount,
          accepted: acceptedApplicationCount,
          rejected: rejectedApplicationCount
        }
      }
    });
  } catch (error) {
    console.error('Get company stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update company subscription
export const updateSubscription = async (req, res) => {
  try {
    const { type, startDate, endDate, status } = req.body;
    
    if (!type || !['free', 'basic', 'premium', 'enterprise'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp loại gói dịch vụ hợp lệ'
      });
    }
    
    const company = await Company.findOne({ user: req.user.id });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thông tin công ty'
      });
    }

    // Update subscription
    company.subscription = {
      type,
      startDate: startDate || new Date(),
      endDate: endDate || (() => {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        return date;
      })(),
      status: status || 'active'
    };
    
    await company.save();

    res.status(200).json({
      success: true,
      data: company,
      message: 'Gói dịch vụ đã được cập nhật'
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};