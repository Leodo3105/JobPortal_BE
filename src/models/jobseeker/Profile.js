import mongoose from 'mongoose';

const EducationSchema = new mongoose.Schema({
  school: {
    type: String,
    required: [true, 'Vui lòng nhập tên trường'],
    trim: true
  },
  degree: {
    type: String,
    required: [true, 'Vui lòng nhập bằng cấp'],
    trim: true
  },
  fieldOfStudy: {
    type: String,
    required: [true, 'Vui lòng nhập chuyên ngành'],
    trim: true
  },
  from: {
    type: Date,
    required: [true, 'Vui lòng nhập ngày bắt đầu']
  },
  to: {
    type: Date
  },
  current: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  }
});

const ExperienceSchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, 'Vui lòng nhập tên công ty'],
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Vui lòng nhập vị trí'],
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  from: {
    type: Date,
    required: [true, 'Vui lòng nhập ngày bắt đầu']
  },
  to: {
    type: Date
  },
  current: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  }
});

const JobseekerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề hồ sơ'],
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  dob: {
    type: Date
  },
  phone: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  skills: [
    {
      type: String,
      trim: true
    }
  ],
  experience: [ExperienceSchema],
  education: [EducationSchema],
  cvFile: {
    type: String,
    trim: true
  },
  socialMedia: {
    linkedin: {
      type: String,
      trim: true
    },
    github: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    }
  },
  desiredPosition: {
    type: String,
    trim: true
  },
  desiredSalary: {
    type: Number
  },
  workType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
    default: 'full-time'
  },
  availableFrom: {
    type: Date
  },
  visibility: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const JobseekerProfile = mongoose.model('JobseekerProfile', JobseekerProfileSchema);

export default JobseekerProfile;