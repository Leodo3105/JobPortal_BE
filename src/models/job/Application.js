import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobseekerProfile',
    required: true
  },
  coverLetter: {
    type: String,
    trim: true
  },
  attachedCV: {
    type: String // File name of CV if different from profile CV
  },
  status: {
    type: String,
    enum: ['pending', 'viewed', 'interview', 'accepted', 'rejected'],
    default: 'pending'
  },
  notes: [{
    content: {
      type: String,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  employerFeedback: {
    type: String,
    trim: true
  },
  interviews: [{
    date: {
      type: Date
    },
    location: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['in-person', 'phone', 'video'],
      default: 'in-person'
    },
    notes: {
      type: String,
      trim: true
    }
  }]
}, {
  timestamps: true
});

// Compound index to ensure one application per user per job
ApplicationSchema.index({ job: 1, user: 1 }, { unique: true });

const Application = mongoose.model('Application', ApplicationSchema);

export default Application;
