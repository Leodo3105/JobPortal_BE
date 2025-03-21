import JobseekerProfile from '../../models/jobseeker/Profile.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload CV file
export const uploadCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng upload file CV'
      });
    }

    // Update profile with CV file path
    let profile = await JobseekerProfile.findOne({ user: req.user.id });

    if (!profile) {
      // Create basic profile if it doesn't exist
      profile = await JobseekerProfile.create({
        user: req.user.id,
        title: `${req.user.name}'s Profile`,
        cvFile: req.file.filename
      });
    } else {
      // Delete old CV file if exists
      if (profile.cvFile) {
        const oldFilePath = path.join(__dirname, '../../uploads/cv', profile.cvFile);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Update CV file path
      profile.cvFile = req.file.filename;
      await profile.save();
    }

    res.status(200).json({
      success: true,
      data: {
        fileName: req.file.filename,
        filePath: `/uploads/cv/${req.file.filename}`
      },
      message: 'CV đã được upload thành công'
    });
  } catch (error) {
    console.error('CV upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete CV file
export const deleteCV = async (req, res) => {
  try {
    const profile = await JobseekerProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy hồ sơ'
      });
    }

    if (!profile.cvFile) {
      return res.status(400).json({
        success: false,
        error: 'Không có CV để xóa'
      });
    }

    // Delete CV file
    const filePath = path.join(__dirname, '../../uploads/cv', profile.cvFile);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Update profile
    profile.cvFile = '';
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'CV đã được xóa'
    });
  } catch (error) {
    console.error('CV delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get CV file
export const getCV = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../../uploads/cv', req.params.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy file CV'
      });
    }
    
    res.download(filePath);
  } catch (error) {
    console.error('Get CV error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};