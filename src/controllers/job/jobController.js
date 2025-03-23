import Job from '../../models/job/Job.js';
import Company from '../../models/employer/Company.js';

// Create a new job
export const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      benefits,
      location,
      jobType,
      category,
      skills,
      experienceLevel,
      educationLevel,
      salaryMin,
      salaryMax,
      salaryCurrency,
      showSalary,
      applicationDeadline
    } = req.body;

    // Find the company associated with the employer
    const company = await Company.findOne({ user: req.user.id });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Bạn cần tạo hồ sơ công ty trước khi đăng tin tuyển dụng'
      });
    }

    // Check for required fields
    if (!title || !description || !requirements || !benefits || !location || !jobType || !category || !applicationDeadline) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
    }

    // Create job
    const job = await Job.create({
      user: req.user.id,
      company: company._id,
      title,
      description,
      requirements,
      benefits,
      location,
      jobType,
      category,
      skills: Array.isArray(skills) ? skills : skills.split(',').map(skill => skill.trim()),
      experienceLevel,
      educationLevel,
      salaryMin,
      salaryMax,
      salaryCurrency,
      showSalary,
      applicationDeadline
    });

    res.status(201).json({
      success: true,
      data: job,
      message: 'Tin tuyển dụng đã được tạo thành công'
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all jobs with pagination and filters
export const getJobs = async (req, res) => {
  try {
    // Build query
    let query = {};
    
    // Filter by status (default to active jobs only)
    query.status = req.query.status || 'active';
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by job type
    if (req.query.jobType) {
      query.jobType = req.query.jobType;
    }
    
    // Filter by location
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }
    
    // Filter by experience level
    if (req.query.experienceLevel) {
      query.experienceLevel = req.query.experienceLevel;
    }
    
    // Filter by salary range
    if (req.query.salary) {
      query.salaryMin = { $lte: parseInt(req.query.salary) };
      query.salaryMax = { $gte: parseInt(req.query.salary) };
    }
    
    // Search by keyword in title, description, requirements or skills
    if (req.query.keyword) {
      query.$text = { $search: req.query.keyword };
    }
    
    // Filter by skills
    if (req.query.skills) {
      const skillsArray = req.query.skills.split(',').map(skill => skill.trim());
      query.skills = { $in: skillsArray };
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Job.countDocuments(query);

    // Execute query
    const jobs = await Job.find(query)
      .populate({
        path: 'company',
        select: 'name logo location industry'
      })
      .sort({ featured: -1, createdAt: -1 })
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
      count: jobs.length,
      pagination,
      totalPages: Math.ceil(total / limit),
      data: jobs
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get single job
export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate({
        path: 'company',
        select: 'name description logo location industry website companySize'
      });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy tin tuyển dụng'
      });
    }

    // Increment view count
    job.views += 1;
    await job.save();

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Get job error:', error);
    
    // Check if error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy tin tuyển dụng'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update job
export const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy tin tuyển dụng'
      });
    }

    // Make sure user is job owner
    if (job.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Bạn không có quyền cập nhật tin tuyển dụng này'
      });
    }

    // Process skills if provided
    if (req.body.skills) {
      req.body.skills = Array.isArray(req.body.skills) 
        ? req.body.skills 
        : req.body.skills.split(',').map(skill => skill.trim());
    }

    // Update job
    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: job,
      message: 'Tin tuyển dụng đã được cập nhật'
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete job
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy tin tuyển dụng'
      });
    }

    // Make sure user is job owner or admin
    if (job.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Bạn không có quyền xóa tin tuyển dụng này'
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Tin tuyển dụng đã được xóa'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get jobs by employer
export const getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Change job status
export const changeJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['active', 'closed', 'draft', 'expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp trạng thái hợp lệ'
      });
    }
    
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy tin tuyển dụng'
      });
    }

    // Make sure user is job owner
    if (job.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Bạn không có quyền cập nhật tin tuyển dụng này'
      });
    }

    // Update job status
    job.status = status;
    await job.save();

    res.status(200).json({
      success: true,
      data: job,
      message: `Trạng thái tin tuyển dụng đã được cập nhật thành ${status}`
    });
  } catch (error) {
    console.error('Change job status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get similar jobs
export const getSimilarJobs = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy tin tuyển dụng'
      });
    }

    // Find similar jobs based on category and skills
    const similarJobs = await Job.find({
      _id: { $ne: job._id }, // Exclude current job
      status: 'active',
      $or: [
        { category: job.category },
        { skills: { $in: job.skills } }
      ]
    })
    .limit(5)
    .populate({
      path: 'company',
      select: 'name logo'
    });

    res.status(200).json({
      success: true,
      count: similarJobs.length,
      data: similarJobs
    });
  } catch (error) {
    console.error('Get similar jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
