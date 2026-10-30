const mongoose = require('mongoose');

const AcademicSchema = new mongoose.Schema(
  {
    college: { type: String, default: '', trim: true },
    department: { type: String, default: '', trim: true },
    degree: { type: String, default: '', trim: true },
    currentYear: { type: Number, default: 3, min: 1, max: 5 },
    graduationYear: { type: Number, default: 2026 },
    cgpa: { type: Number, default: null, min: 0, max: 10 },
  },
  { _id: false }
);

const SocialLinksSchema = new mongoose.Schema(
  {
    github: { type: String, default: '', trim: true },
    linkedin: { type: String, default: '', trim: true },
    leetcode: { type: String, default: '', trim: true },
    codeforces: { type: String, default: '', trim: true },
    portfolio: { type: String, default: '', trim: true },
    otherLinks: [{ type: String, trim: true }],
  },
  { _id: false }
);

const StudentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    headline: {
      type: String,
      default: '',
      trim: true,
      maxlength: [120, 'Headline cannot exceed 120 characters'],
    },
    bio: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    contactNumber: {
      type: String,
      default: '',
      trim: true,
    },
    technicalInterests: [{ type: String, trim: true }],
    academic: {
      type: AcademicSchema,
      default: () => ({}),
    },
    socialLinks: {
      type: SocialLinksSchema,
      default: () => ({}),
    },
    targetRoleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoleDefinition',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to calculate profile completion percentage
StudentProfileSchema.virtual('completionPercentage').get(function () {
  let score = 0;
  let totalPoints = 7;

  if (this.headline && this.headline.trim()) score += 1;
  if (this.bio && this.bio.trim()) score += 1;
  if (this.academic?.college && this.academic?.department) score += 1;
  if (this.academic?.cgpa) score += 1;
  if (this.socialLinks?.github || this.socialLinks?.portfolio) score += 1;
  if (this.socialLinks?.linkedin) score += 1;
  if (this.technicalInterests && this.technicalInterests.length > 0) score += 1;

  return Math.round((score / totalPoints) * 100);
});

StudentProfileSchema.set('toObject', { virtuals: true });
StudentProfileSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
