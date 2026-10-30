const mongoose = require('mongoose');

const FileRefSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadPath: { type: String, required: true },
  },
  { _id: false }
);

const EvidenceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Evidence title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    type: {
      type: String,
      required: [true, 'Evidence type is required'],
      enum: [
        'assessment',
        'project',
        'certificate',
        'internship',
        'coding_profile',
        'achievement',
        'resume',
      ],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    source: {
      type: String,
      default: '',
      trim: true,
    },
    sourceUrl: {
      type: String,
      default: '',
      trim: true,
    },
    fileRef: {
      type: FileRefSchema,
      default: null,
    },
    relatedSkills: [{ type: String, trim: true }],
    score: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
    },
    connectionStatus: {
      type: String,
      enum: [
        'not_connected',
        'url_added',
        'connection_pending',
        'connected_verified',
        'connection_error',
      ],
      default: 'not_connected',
    },
    evidenceDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

EvidenceSchema.index({ student: 1, type: 1 });
EvidenceSchema.index({ student: 1, relatedSkills: 1 });

module.exports = mongoose.model('Evidence', EvidenceSchema);
