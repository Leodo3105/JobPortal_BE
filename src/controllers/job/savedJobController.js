import SavedJob from '../../models/job/SavedJob.js';
import Job from '../../models/job/Job.js';

// Save a job
export const saveJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    
    // Check if job exists
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy tin tuyển dụng'
      });
    }
    
    // Check if job is already saved
    const existingSave = await SavedJob.findOne({
      user: req.user.id,
      job: jobId
    });
    
    if (existingSave) {
      return res.status(400).json({
        success: false,
        error: 'Tin tuyển dụng đã được lưu'
      });
    }
    
    // Save job
    const savedJob = await SavedJob.create({
      user: req.user.id,
      job: jobId
    });
    
    res.status(201).json({
      success: true,
      data: savedJob,
      message: 'Tin tuyển dụng đã được lưu'
    });
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Unsave a job
export const unsaveJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    
    // Delete saved job record
    const result = await SavedJob.findOneAndDelete({
      user: req.user.id,
      job: jobId
    });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Tin tuyển dụng chưa được lưu'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Đã xóa tin tuyển dụng khỏi danh sách đã lưu'
    });
  } catch (error) {
    console.error('Unsave job error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get user's saved jobs
export const getSavedJobs = async (req, res) => {
  try {
    // Find all saved jobs for user
    const savedJobs = await SavedJob.find({ user: req.user.id })
      .populate({
        path: 'job',
        select: 'title company location jobType status applicationDeadline createdAt',
        populate: {
          path: 'company',
          select: 'name logo'
        }
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: savedJobs.length,
      data: savedJobs
    });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};