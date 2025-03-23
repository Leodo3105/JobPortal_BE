import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'application_status', 
      'new_application', 
      'interview_invitation', 
      'job_recommendation', 
      'message', 
      'system'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Job', 'Application', 'Chat', 'User', 'Company'],
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  read: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;