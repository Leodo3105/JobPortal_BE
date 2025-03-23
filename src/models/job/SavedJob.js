import mongoose from 'mongoose';

const SavedJobSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure job is saved once per user
SavedJobSchema.index({ job: 1, user: 1 }, { unique: true });

const SavedJob = mongoose.model('SavedJob', SavedJobSchema);

export default SavedJob;