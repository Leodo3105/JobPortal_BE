import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Tin nhắn không được để trống'],
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Job', 'Application'],
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  }
}, {
  timestamps: true
});

const Message = mongoose.model('Message', MessageSchema);

export default Message;