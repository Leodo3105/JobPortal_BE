import JobseekerProfile from '../../models/jobseeker/Profile.js';
import User from '../../models/User.js';

// Get current user profile
export const getCurrentProfile = async (req, res) => {
  try {
    const profile = await JobseekerProfile.findOne({ user: req.user.id }).populate('user', 'name email role');

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Chưa có hồ sơ cho người dùng này'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create or update user profile
export const createOrUpdateProfile = async (req, res) => {
  try {
    const {
      title,
      bio,
      location,
      dob,
      phone,
      website,
      skills,
      socialMedia,
      desiredPosition,
      desiredSalary,
      workType,
      availableFrom,
      visibility
    } = req.body;

    // Check if title is provided
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Tiêu đề hồ sơ là bắt buộc'
      });
    }

    // Build profile object
    const profileFields = {
      user: req.user.id,
      title,
      bio: bio || '',
      location: location || '',
      dob: dob || null,
      phone: phone || '',
      website: website || '',
      desiredPosition: desiredPosition || '',
      desiredSalary: desiredSalary || 0,
      workType: workType || 'full-time',
      visibility: visibility !== undefined ? visibility : true
    };

    // Process date if provided
    if (availableFrom) {
      profileFields.availableFrom = availableFrom;
    }

    // Skills - Split into array
    if (skills) {
      profileFields.skills = Array.isArray(skills) 
        ? skills 
        : skills.split(',').map(skill => skill.trim());
    }

    // Social media links
    if (socialMedia) {
      profileFields.socialMedia = {
        linkedin: socialMedia.linkedin || '',
        github: socialMedia.github || '',
        twitter: socialMedia.twitter || ''
      };
    }

    // Check if profile exists
    let profile = await JobseekerProfile.findOne({ user: req.user.id });

    if (profile) {
      // Update existing profile
      profile = await JobseekerProfile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      
      return res.status(200).json({
        success: true,
        data: profile,
        message: 'Hồ sơ đã được cập nhật'
      });
    }

    // Create new profile
    profile = await JobseekerProfile.create(profileFields);

    res.status(201).json({
      success: true,
      data: profile,
      message: 'Hồ sơ đã được tạo'
    });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Add profile education
export const addEducation = async (req, res) => {
  try {
    const { school, degree, fieldOfStudy, from, to, current, description } = req.body;

    // Validate required fields
    if (!school || !degree || !fieldOfStudy || !from) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp đầy đủ thông tin: trường, bằng cấp, chuyên ngành và ngày bắt đầu'
      });
    }

    const newEducation = {
      school,
      degree,
      fieldOfStudy,
      from,
      to,
      current,
      description
    };

    const profile = await JobseekerProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Chưa có hồ sơ cho người dùng này'
      });
    }

    profile.education.unshift(newEducation); // Add to beginning of array
    await profile.save();

    res.status(200).json({
      success: true,
      data: profile,
      message: 'Thêm thông tin học vấn thành công'
    });
  } catch (error) {
    console.error('Add education error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete education from profile
export const deleteEducation = async (req, res) => {
  try {
    const profile = await JobseekerProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy hồ sơ'
      });
    }

    // Get remove index
    const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(req.params.edu_id);

    if (removeIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thông tin học vấn'
      });
    }

    profile.education.splice(removeIndex, 1);
    await profile.save();

    res.status(200).json({
      success: true,
      data: profile,
      message: 'Đã xóa thông tin học vấn'
    });
  } catch (error) {
    console.error('Delete education error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Add profile experience
export const addExperience = async (req, res) => {
  try {
    const { company, position, location, from, to, current, description } = req.body;

    // Validate required fields
    if (!company || !position || !from) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp đầy đủ thông tin: công ty, vị trí và ngày bắt đầu'
      });
    }

    const newExperience = {
      company,
      position,
      location,
      from,
      to,
      current,
      description
    };

    const profile = await JobseekerProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Chưa có hồ sơ cho người dùng này'
      });
    }

    profile.experience.unshift(newExperience); // Add to beginning of array
    await profile.save();

    res.status(200).json({
      success: true,
      data: profile,
      message: 'Thêm kinh nghiệm làm việc thành công'
    });
  } catch (error) {
    console.error('Add experience error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete experience from profile
export const deleteExperience = async (req, res) => {
  try {
    const profile = await JobseekerProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy hồ sơ'
      });
    }

    // Get remove index
    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id);

    if (removeIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy kinh nghiệm làm việc'
      });
    }

    profile.experience.splice(removeIndex, 1);
    await profile.save();

    res.status(200).json({
      success: true,
      data: profile,
      message: 'Đã xóa kinh nghiệm làm việc'
    });
  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all profiles
export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await JobseekerProfile.find({ visibility: true })
      .populate('user', 'name avatar')
      .select('-__v');

    res.status(200).json({
      success: true,
      count: profiles.length,
      data: profiles
    });
  } catch (error) {
    console.error('Get all profiles error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get profile by ID
export const getProfileById = async (req, res) => {
  try {
    const profile = await JobseekerProfile.findOne({
      user: req.params.user_id,
      visibility: true
    }).populate('user', 'name avatar');

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy hồ sơ cho người dùng này'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get profile by id error:', error);
    
    // Check if error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy hồ sơ'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete profile and user
export const deleteProfile = async (req, res) => {
  try {
    // Remove profile
    await JobseekerProfile.findOneAndRemove({ user: req.user.id });
    
    // Remove user
    await User.findByIdAndRemove(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Đã xóa tài khoản'
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};