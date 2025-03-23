import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên công ty'],
    trim: true,
    maxlength: [100, 'Tên công ty không được quá 100 ký tự']
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả công ty'],
    trim: true
  },
  website: {
    type: String,
    trim: true,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Vui lòng nhập URL hợp lệ có http:// hoặc https://'
    ]
  },
  industry: {
    type: String,
    required: [true, 'Vui lòng chọn ngành nghề'],
    trim: true
  },
  companySize: {
    type: String,
    required: [true, 'Vui lòng chọn quy mô công ty'],
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
  },
  location: {
    type: String,
    required: [true, 'Vui lòng nhập địa chỉ công ty'],
    trim: true
  },
  logo: {
    type: String,
    default: 'default-company-logo.png'
  },
  foundedYear: {
    type: Number
  },
  socialMedia: {
    facebook: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    }
  },
  subscription: {
    type: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: function() {
        // Default to 1 month from now for free plan
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        return date;
      }
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'canceled'],
      default: 'active'
    }
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Company = mongoose.model('Company', CompanySchema);

export default Company;