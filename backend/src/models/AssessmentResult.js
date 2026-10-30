const mongoose = require('mongoose');

const AssessmentResultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Assessment title is required'],
      trim: true,
    },
    assessmentType: {
      type: String,
      default: 'College Diagnostic Assessment',
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: 0,
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    skillsAssessed: [{ type: String, trim: true }],
    completionDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

AssessmentResultSchema.pre('save', function (next) {
  if (this.maxScore && this.maxScore > 0) {
    this.percentage = Math.round((this.score / this.maxScore) * 100);
  }
  next();
});

module.exports = mongoose.model('AssessmentResult', AssessmentResultSchema);
