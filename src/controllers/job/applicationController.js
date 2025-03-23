import Application from '../../models/job/Application.js';
import Job from '../../models/job/Job.js';
import JobseekerProfile from '../../models/jobseeker/Profile.js';
import Notification from '../../models/notification/Notification.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Apply for a job
export const applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    // Check if required fields exist
    if (!jobId) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp ID của công việc'
      });
    }

    // Check if job exists and is active
    const job = await Job.findById(jobId).populate('company user');
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy tin tuyển dụng'
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Tin tuyển dụng này không còn nhận hồ sơ'
      });
    }

    // Check if deadline has passed
    if (new Date(job.applicationDeadline) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Đã hết hạn nộp hồ sơ cho tin tuyển dụng này'
      });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      user: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: 'Bạn đã ứng tuyển vào vị trí này'
      });
    }

    // Get user's profile
    const profile = await JobseekerProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(400).json({
        success: false,
        error: 'Bạn cần tạo hồ sơ trước khi ứng tuyển'
      });
    }

    if (!profile.cvFile) {
      return res.status(400).json({
        success: false,
        error: 'Bạn cần tải lên CV trước khi ứng tuyển'
      });
    }

    // Create application
    let attachedCV = '';
    
    // If custom CV is uploaded, save it
    if (req.file) {
      attachedCV = req.file.filename;
    } else {
      attachedCV = profile.cvFile;
    }

    const application = await Application.create({
      job: jobId,
      user: req.user.id,
      profile: profile._id,
      coverLetter: coverLetter || '',
      attachedCV
    });

    // Create notification for employer
    await Notification.create({
      user: job.user._id,
      type: 'new_application',
      title: 'Ứng viên mới ứng tuyển',
      message: `Có ứng viên mới ứng tuyển vào vị trí "${job.title}"`,
      relatedTo: {
        model: 'Application',
        id: application._id
      },
      link: `/employer/applications/${application._id}`
    });

    res.status(201).json({
      success: true,
      data: application,
      message: 'Ứng tuyển thành công'
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all applications for a specific job
export const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if job exists and user is the owner
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy tin tuyển dụng'
      });
    }

    if (job.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Bạn không có quyền xem ứng viên của tin tuyển dụng này'
      });
    }

    // Get all applications for the job
    const applications = await Application.find({ job: jobId })
      .populate({
        path: 'user',
        select: 'name email avatar'
      })
      .populate({
        path: 'profile',
        select: 'title skills experience education'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get application details
export const getApplicationDetails = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name email avatar phone'
      })
      .populate({
        path: 'profile',
        select: 'title bio skills experience education socialMedia location website'
      })
      .populate({
        path: 'job',
        select: 'title company',
        populate: {
          path: 'company',
          select: 'name'
        }
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy hồ sơ ứng tuyển'
      });
    }

    // Check authorization
    if (
      req.user.role === 'employer' && 
      application.job.user.toString() !== req.user.id
    ) {
      return res.status(401).json({
        success: false,
        error: 'Bạn không có quyền xem hồ sơ ứng tuyển này'
      });
    }

    if (
      req.user.role === 'jobseeker' && 
      application.user.toString() !== req.user.id
    ) {
      return res.status(401).json({
        success: false,
        error: 'Bạn không có quyền xem hồ sơ ứng tuyển này'
      });
    }

    // If employer is viewing, mark as viewed
    if (
      req.user.role === 'employer' && 
      application.status === 'pending'
    ) {
      application.status = 'viewed';
      await application.save();
      
      // Notify jobseeker
      await Notification.create({
        user: application.user._id,
        type: 'application_status',
        title: 'Đơn ứng tuyển đã được xem',
        message: `Nhà tuyển dụng đã xem đơn ứng tuyển của bạn cho vị trí "${application.job.title}"`,
        relatedTo: {
          model: 'Application',
          id: application._id
        },
        link: `/jobseeker/applications/${application._id}`
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Get application details error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    
    if (!status || !['pending', 'viewed', 'interview', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp trạng thái hợp lệ'
      });
    }
    
    let application = await Application.findById(req.params.id)
      .populate({
        path: 'job',
        select: 'title user'
      })
      .populate({
        path: 'user',
        select: 'name'
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy hồ sơ ứng tuyển'
      });
    }

    // Check if user is the employer who posted the job
    if (application.job.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Bạn không có quyền cập nhật trạng thái ứng tuyển này'
      });
    }

    // Update application
    application.status = status;
    
    if (feedback) {
      application.employerFeedback = feedback;
    }
    
    await application.save();

    // Create notification for jobseeker
    let notificationTitle, notificationMessage;
    
    switch (status) {
      case 'interview':
        notificationTitle = 'Lời mời phỏng vấn';
        notificationMessage = `Bạn đã được mời phỏng vấn cho vị trí "${application.job.title}"`;
        break;
      case 'accepted':
        notificationTitle = 'Chúc mừng! Đơn ứng tuyển được chấp nhận';
        notificationMessage = `Đơn ứng tuyển của bạn cho vị trí "${application.job.title}" đã được chấp nhận`;
        break;
      case 'rejected':
        notificationTitle = 'Đơn ứng tuyển không được chấp nhận';
        notificationMessage = `Đơn ứng tuyển của bạn cho vị trí "${application.job.title}" đã bị từ chối`;
        break;
      default:
        notificationTitle = 'Cập nhật đơn ứng tuyển';
        notificationMessage = `Trạng thái đơn ứng tuyển của bạn cho vị trí "${application.job.title}" đã được cập nhật thành ${status}`;
    }

    await Notification.create({
      user: application.user._id,
      type: 'application_status',
      title: notificationTitle,
      message: notificationMessage + (feedback ? `. Phản hồi: ${feedback}` : ''),
      relatedTo: {
        model: 'Application',
        id: application._id
      },
      link: `/jobseeker/applications/${application._id}`
    });

    res.status(200).json({
      success: true,
      data: application,
      message: 'Cập nhật trạng thái thành công'
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Schedule an interview
export const scheduleInterview = async (req, res) => {
  try {
    const { date, location, type, notes } = req.body;
    
    if (!date || !location || !type) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp đầy đủ thông tin: ngày, địa điểm và hình thức phỏng vấn'
      });
    }
    
    let application = await Application.findById(req.params.id)
      .populate({
        path: 'job',
        select: 'title user'
      })
      .populate({
        path: 'user',
        select: 'name'
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy hồ sơ ứng tuyển'
      });
    }

    // Check if user is the employer who posted the job
    if (application.job.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Bạn không có quyền cập nhật ứng tuyển này'
      });
    }

    // Add interview to application
    const interview = {
      date,
      location,
      type,
      notes: notes || ''
    };
    
    application.interviews.push(interview);
    application.status = 'interview';
    await application.save();

    // Create notification for jobseeker
    await Notification.create({
      user: application.user._id,
      type: 'interview_invitation',
      title: 'Lời mời phỏng vấn',
      message: `Bạn đã được mời phỏng vấn cho vị trí "${application.job.title}" vào ngày ${new Date(date).toLocaleDateString('vi-VN')}`,
      relatedTo: {
        model: 'Application',
        id: application._id
      },
      link: `/jobseeker/applications/${application._id}`
    });

    res.status(200).json({
      success: true,
      data: application,
      message: 'Đã lên lịch phỏng vấn thành công'
    });
  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get application CV
export const getApplicationCV = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'job',
        select: 'user'
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy hồ sơ ứng tuyển'
      });
    }

    // Check authorization
    if (
      req.user.role === 'employer' && 
      application.job.user.toString() !== req.user.id
    ) {
      return res.status(401).json({
        success: false,
        error: 'Bạn không có quyền xem CV này'
      });
    }

    if (
      req.user.role === 'jobseeker' && 
      application.user.toString() !== req.user.id
    ) {
      return res.status(401).json({
        success: false,
        error: 'Bạn không có quyền xem CV này'
      });
    }

    const filePath = path.join(__dirname, '../../../uploads/cv', application.attachedCV);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy file CV'
      });
    }
    
    res.download(filePath);
  } catch (error) {
    console.error('Get application CV error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get user's applications
export const getUserApplications = async (req, res) => {
  try {
    // For jobseekers - get all applications they've submitted
    const applications = await Application.find({ user: req.user.id })
      .populate({
        path: 'job',
        select: 'title company status applicationDeadline',
        populate: {
          path: 'company',
          select: 'name logo'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Add note to application
export const addApplicationNote = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập nội dung ghi chú'
      });
    }
    
    let application = await Application.findById(req.params.id)
      .populate({
        path: 'job',
        select: 'user'
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy hồ sơ ứng tuyển'
      });
    }

    // Check if user is the employer who posted the job
    if (application.job.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Bạn không có quyền thêm ghi chú cho ứng tuyển này'
      });
    }

    // Add note
    application.notes.push({ content });
    await application.save();

    res.status(200).json({
      success: true,
      data: application,
      message: 'Đã thêm ghi chú thành công'
    });
  } catch (error) {
    console.error('Add application note error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};