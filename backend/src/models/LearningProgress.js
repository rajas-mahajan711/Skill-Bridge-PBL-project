const mongoose = require('mongoose');

const LearningProgressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningResource',
      required: true,
    },
    status: {
      type: String,
      enum: ['recommended', 'not_started', 'in_progress', 'completed'],
      default: 'recommended',
    },
    progressPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    startDate: {
      type: Date,
      default: null,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

LearningProgressSchema.index({ student: 1, resource: 1 }, { unique: true });

module.exports = mongoose.model('LearningProgress', LearningProgressSchema);
