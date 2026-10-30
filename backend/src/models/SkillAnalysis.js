const mongoose = require('mongoose');

const SkillAnalysisSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoleDefinition',
      required: true,
    },
    roleTitle: {
      type: String,
      required: true,
    },
    readinessScore: {
      type: Number,
      required: true,
      default: 0,
    },
    readinessBand: {
      type: String,
      default: 'Developing',
    },
    skillScores: [
      {
        skillName: String,
        score: Number,
        confidenceScore: Number,
        confidenceLevel: String,
        supportingEvidenceCount: Number,
        evidenceSources: [String],
        status: String,
        explanation: String,
      },
    ],
    gaps: [
      {
        skillName: String,
        category: String,
        status: String,
        currentLevel: Number,
        requiredLevel: Number,
        importance: String,
        confidenceLevel: String,
        evidenceCount: Number,
        gapDifference: Number,
        whyItMatters: String,
        suggestedAction: String,
      },
    ],
    calculationSummary: String,
    calculationVersion: {
      type: String,
      default: 'v1.0-deterministic',
    },
    analysisTimestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

SkillAnalysisSchema.index({ student: 1, targetRole: 1 });

module.exports = mongoose.model('SkillAnalysis', SkillAnalysisSchema);
