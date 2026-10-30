const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Frontend',
        'Backend',
        'Database',
        'Cloud',
        'DevOps & Tools',
        'Languages',
        'CS Fundamentals',
        'Architecture',
        'Data Analysis',
        'AI/Data',
        'Soft Skills',
        'General',
      ],
      default: 'General',
    },
    description: {
      type: String,
      default: '',
    },
    aliases: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

SkillSchema.index({ name: 1 });
SkillSchema.index({ category: 1 });

module.exports = mongoose.model('Skill', SkillSchema);
