// src/controllers/dashboardController.js
import User from '../models/User.js';
import Job from '../models/job/Job.js';
import Company from '../models/employer/Company.js';
import Application from '../models/job/Application.js';
import JobseekerProfile from '../models/jobseeker/Profile.js';
import SavedJob from '../models/job/SavedJob.js';

// Get admin dashboard statistics
export const getAdminDashboard = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const jobseekersCount = await User.countDocuments({ role: 'jobseeker' });
    const employersCount = await User.countDocuments({ role: 'employer' });
    const adminsCount = await User.countDocuments({ role: 'admin' });
    
    // Jobs statistics
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const closedJobs = await Job.countDocuments({ status: 'closed' });
    const expiredJobs = await Job.countDocuments({ status: 'expired' });
    const draftJobs = await Job.countDocuments({ status: 'draft' });
    
    // Applications statistics
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const viewedApplications = await Application.countDocuments({ status: 'viewed' });
    const interviewApplications = await Application.countDocuments({ status: 'interview' });
    const acceptedApplications = await Application.countDocuments({ status: 'accepted' });
    const rejectedApplications = await Application.countDocuments({ status: 'rejected' });
    
    // Companies statistics
    const totalCompanies = await Company.countDocuments();
    const featuredCompanies = await Company.countDocuments({ featured: true });
    
    // Profiles statistics
    const totalProfiles = await JobseekerProfile.countDocuments();
    const profilesWithCV = await JobseekerProfile.countDocuments({ cvFile: { $ne: '' } });
    
    // Monthly statistics - get counts for the last 6 months
    const months = [];
    const labels = [];
    const newUsers = [];
    const newJobs = [];
    const newApplications = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      // Format month name
      const monthName = date.toLocaleString('default', { month: 'short' });
      labels.push(`${monthName} ${date.getFullYear()}`);
      months.push({ startOfMonth, endOfMonth });
      
      // Get counts for the month
      const usersInMonth = await User.countDocuments({
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      });
      
      const jobsInMonth = await Job.countDocuments({
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      });
      
      const applicationsInMonth = await Application.countDocuments({
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      });
      
      newUsers.push(usersInMonth);
      newJobs.push(jobsInMonth);
      newApplications.push(applicationsInMonth);
    }
    
    // Job categories statistics
    const jobCategories = await Job.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Job locations statistics
    const jobLocations = await Job.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          jobseekers: jobseekersCount,
          employers: employersCount,
          admins: adminsCount
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
          closed: closedJobs,
          expired: expiredJobs,
          draft: draftJobs
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          viewed: viewedApplications,
          interview: interviewApplications,
          accepted: acceptedApplications,
          rejected: rejectedApplications
        },
        companies: {
          total: totalCompanies,
          featured: featuredCompanies
        },
        profiles: {
          total: totalProfiles,
          withCV: profilesWithCV
        },
        charts: {
          labels,
          datasets: {
            newUsers,
            newJobs,
            newApplications
          }
        },
        popular: {
          categories: jobCategories,
          locations: jobLocations
        }
      }
    });
  } catch (error) {
    console.error('Get admin dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get employer dashboard statistics
export const getEmployerDashboard = async (req, res) => {
  try {
    // Find the company
    const company = await Company.findOne({ user: req.user.id });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thông tin công ty'
      });
    }
    
    // Jobs statistics
    const totalJobs = await Job.countDocuments({ company: company._id });
    const activeJobs = await Job.countDocuments({ company: company._id, status: 'active' });
    const closedJobs = await Job.countDocuments({ company: company._id, status: 'closed' });
    const expiredJobs = await Job.countDocuments({ company: company._id, status: 'expired' });
    const draftJobs = await Job.countDocuments({ company: company._id, status: 'draft' });
    
    // Get all job IDs for this company
    const jobIds = (await Job.find({ company: company._id }).select('_id')).map(job => job._id);
    
    // Applications statistics
    const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });
    const pendingApplications = await Application.countDocuments({ job: { $in: jobIds }, status: 'pending' });
    const viewedApplications = await Application.countDocuments({ job: { $in: jobIds }, status: 'viewed' });
    const interviewApplications = await Application.countDocuments({ job: { $in: jobIds }, status: 'interview' });
    const acceptedApplications = await Application.countDocuments({ job: { $in: jobIds }, status: 'accepted' });
    const rejectedApplications = await Application.countDocuments({ job: { $in: jobIds }, status: 'rejected' });
    
    // Monthly statistics - get counts for the last 6 months
    const months = [];
    const labels = [];
    const newJobs = [];
    const newApplications = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      // Format month name
      const monthName = date.toLocaleString('default', { month: 'short' });
      labels.push(`${monthName} ${date.getFullYear()}`);
      months.push({ startOfMonth, endOfMonth });
      
      // Get counts for the month
      const jobsInMonth = await Job.countDocuments({
        company: company._id,
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      });
      
      const applicationsInMonth = await Application.countDocuments({
        job: { $in: jobIds },
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      });
      
      newJobs.push(jobsInMonth);
      newApplications.push(applicationsInMonth);
    }
    
    // Job performance statistics
    const jobPerformance = await Job.aggregate([
      { $match: { company: company._id } },
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: 'job',
          as: 'applications'
        }
      },
      { 
        $project: {
          title: 1,
          status: 1,
          createdAt: 1,
          applicationDeadline: 1,
          views: 1,
          applicationsCount: { $size: '$applications' }
        }
      },
      { $sort: { applicationsCount: -1 } },
      { $limit: 5 }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        jobs: {
          total: totalJobs,
          active: activeJobs,
          closed: closedJobs,
          expired: expiredJobs,
          draft: draftJobs
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          viewed: viewedApplications,
          interview: interviewApplications,
          accepted: acceptedApplications,
          rejected: rejectedApplications
        },
        charts: {
          labels,
          datasets: {
            newJobs,
            newApplications
          }
        },
        topJobs: jobPerformance
      }
    });
  } catch (error) {
    console.error('Get employer dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get jobseeker dashboard statistics
export const getJobseekerDashboard = async (req, res) => {
  try {
    // Applications statistics
    const totalApplications = await Application.countDocuments({ user: req.user.id });
    const pendingApplications = await Application.countDocuments({ user: req.user.id, status: 'pending' });
    const viewedApplications = await Application.countDocuments({ user: req.user.id, status: 'viewed' });
    const interviewApplications = await Application.countDocuments({ user: req.user.id, status: 'interview' });
    const acceptedApplications = await Application.countDocuments({ user: req.user.id, status: 'accepted' });
    const rejectedApplications = await Application.countDocuments({ user: req.user.id, status: 'rejected' });
    
    // Saved jobs count
    const savedJobsCount = await SavedJob.countDocuments({ user: req.user.id });
    
    // Profile completion percentage
    let profileCompletionPercentage = 0;
    const profile = await JobseekerProfile.findOne({ user: req.user.id });
    
    if (profile) {
      // Define fields that contribute to profile completion
      const totalFields = 11; // Adjust based on your important fields
      let completedFields = 0;
      
      // Count completed fields
      if (profile.title) completedFields++;
      if (profile.bio) completedFields++;
      if (profile.location) completedFields++;
      if (profile.skills && profile.skills.length > 0) completedFields++;
      if (profile.experience && profile.experience.length > 0) completedFields++;
      if (profile.education && profile.education.length > 0) completedFields++;
      if (profile.cvFile) completedFields++;
      if (profile.desiredPosition) completedFields++;
      if (profile.desiredSalary) completedFields++;
      if (profile.workType) completedFields++;
      if (profile.socialMedia && (profile.socialMedia.linkedin || profile.socialMedia.github)) completedFields++;
      
      profileCompletionPercentage = Math.round((completedFields / totalFields) * 100);
    }
    
    // Monthly statistics - applications per month for the last 6 months
    const months = [];
    const labels = [];
    const applicationsPerMonth = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      // Format month name
      const monthName = date.toLocaleString('default', { month: 'short' });
      labels.push(`${monthName} ${date.getFullYear()}`);
      
      // Get application count for the month
      const applicationsInMonth = await Application.countDocuments({
        user: req.user.id,
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      });
      
      applicationsPerMonth.push(applicationsInMonth);
    }
    
    // Recent applications
    const recentApplications = await Application.find({ user: req.user.id })
      .populate({
        path: 'job',
        select: 'title company',
        populate: {
          path: 'company',
          select: 'name logo'
        }
      })
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.status(200).json({
      success: true,
      data: {
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          viewed: viewedApplications,
          interview: interviewApplications,
          accepted: acceptedApplications,
          rejected: rejectedApplications
        },
        savedJobs: savedJobsCount,
        profileCompletion: profileCompletionPercentage,
        charts: {
          labels,
          datasets: {
            applicationsPerMonth
          }
        },
        recentApplications
      }
    });
  } catch (error) {
    console.error('Get jobseeker dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get dashboard stats based on user role
export const getDashboard = async (req, res, next) => {
  try {
    const role = req.user.role;
    
    switch (role) {
      case 'admin':
        return await getAdminDashboard(req, res);
      case 'employer':
        return await getEmployerDashboard(req, res);
      case 'jobseeker':
        return await getJobseekerDashboard(req, res);
      default:
        return res.status(403).json({
          success: false,
          error: 'Bạn không có quyền truy cập dashboard'
        });
    }
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};