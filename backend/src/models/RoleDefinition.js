const mongoose = require('mongoose');

const RoleSkillSchema = new mongoose.Schema(
  {
    skillName: { type: String, required: true, trim: true },
    minLevel: { type: Number, required: true, min: 0, max: 100 },
    importance: {
      type: String,
      enum: ['required', 'preferred'],
      default: 'required',
    },
    category: { type: String, default: 'General' },
  },
  { _id: false }
);

const RoleDefinitionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Role title is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Role slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    requiredSkills: [RoleSkillSchema],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RoleDefinition', RoleDefinitionSchema);
