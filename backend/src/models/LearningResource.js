const mongoose = require('mongoose');

const LearningResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    targetSkills: [{ type: String, trim: true }],
    sourceName: {
      type: String,
      required: [true, 'Source name is required'],
      trim: true,
    },
    sourceUrl: {
      type: String,
      required: [true, 'Source URL is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    estimatedHours: {
      type: Number,
      default: 10,
      min: 1,
    },
    isDemo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

LearningResourceSchema.index({ targetSkills: 1 });

module.exports = mongoose.model('LearningResource', LearningResourceSchema);
