import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề công việc'],
    trim: true,
    maxlength: [100, 'Tiêu đề không được quá 100 ký tự']
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả công việc'],
    trim: true
  },
  requirements: {
    type: String,
    required: [true, 'Vui lòng nhập yêu cầu công việc'],
    trim: true
  },
  benefits: {
    type: String,
    required: [true, 'Vui lòng nhập quyền lợi'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Vui lòng nhập địa điểm làm việc'],
    trim: true
  },
  jobType: {
    type: String,
    required: [true, 'Vui lòng chọn loại công việc'],
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
    default: 'full-time'
  },
  category: {
    type: String,
    required: [true, 'Vui lòng chọn ngành nghề'],
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  experienceLevel: {
    type: String,
    required: [true, 'Vui lòng chọn mức kinh nghiệm'],
    enum: ['entry', 'junior', 'mid-level', 'senior', 'executive'],
    default: 'mid-level'
  },
  educationLevel: {
    type: String,
    enum: ['high-school', 'associate', 'bachelor', 'master', 'phd', 'any'],
    default: 'any'
  },
  salaryMin: {
    type: Number
  },
  salaryMax: {
    type: Number
  },
  salaryCurrency: {
    type: String,
    default: 'VND'
  },
  showSalary: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft', 'expired'],
    default: 'active'
  },
  applicationDeadline: {
    type: Date,
    required: [true, 'Vui lòng nhập hạn nộp hồ sơ']
  },
  views: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for search
JobSchema.index({ 
  title: 'text', 
  description: 'text', 
  requirements: 'text',
  skills: 'text'
});

const Job = mongoose.model('Job', JobSchema);

export default Job;