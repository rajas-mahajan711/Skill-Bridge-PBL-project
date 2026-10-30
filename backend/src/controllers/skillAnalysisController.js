const RoleDefinition = require('../models/RoleDefinition');
const Evidence = require('../models/Evidence');
const SkillAnalysis = require('../models/SkillAnalysis');
const StudentProfile = require('../models/StudentProfile');
const AIServiceClient = require('../services/aiServiceClient');

/**
 * Get all available roles
 * GET /api/roles
 */
exports.getRoles = async (req, res, next) => {
  try {
    const roles = await RoleDefinition.find({ active: true }).sort({ title: 1 });
    res.status(200).json({
      success: true,
      count: roles.length,
      roles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get role by ID
 * GET /api/roles/:id
 */
exports.getRoleById = async (req, res, next) => {
  try {
    const role = await RoleDefinition.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role definition not found.',
      });
    }
    res.status(200).json({
      success: true,
      role,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Execute skill gap analysis for current student against a role
 * POST /api/skill-analysis
 */
exports.runSkillAnalysis = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { roleId } = req.body;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a target roleId to run analysis.',
      });
    }

    const role = await RoleDefinition.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Target role definition not found.',
      });
    }

    // 1. Fetch student evidence
    const evidenceList = await Evidence.find({ student: studentId });

    // 2. Evaluate skills
    const roleSkills = (role.requiredSkills || []).map((r) => r.skillName);
    const evalResult = await AIServiceClient.analyzeSkills(evidenceList, roleSkills);
    const evaluatedSkills = evalResult.data.skills || [];

    // 3. Run gap analysis
    const gapResult = await AIServiceClient.analyzeSkillGaps(role, evaluatedSkills);
    const analysisData = gapResult.data;

    // 4. Persist snapshot
    const savedSnapshot = await SkillAnalysis.create({
      student: studentId,
      targetRole: role._id,
      roleTitle: role.title,
      readinessScore: analysisData.readiness_score,
      readinessBand: analysisData.readiness_band,
      skillScores: evaluatedSkills.map((s) => ({
        skillName: s.skill_name,
        score: s.score,
        confidenceScore: s.confidence_score,
        confidenceLevel: s.confidence_level,
        supportingEvidenceCount: s.supporting_evidence_count,
        evidenceSources: s.evidence_sources,
        status: s.status,
        explanation: s.explanation,
      })),
      gaps: (analysisData.gaps || []).map((g) => ({
        skillName: g.skill_name,
        category: g.category,
        status: g.status,
        currentLevel: g.current_level,
        requiredLevel: g.required_level,
        importance: g.importance,
        confidenceLevel: g.confidence_level,
        evidenceCount: g.evidence_count,
        gapDifference: g.gap_difference,
        whyItMatters: g.why_it_matters,
        suggestedAction: g.suggested_action,
      })),
      calculationSummary: analysisData.calculation_summary,
      calculationVersion: 'v1.0-deterministic',
    });

    // Also update student profile targetRoleId
    await StudentProfile.findOneAndUpdate(
      { user: studentId },
      { targetRoleId: role._id }
    );

    res.status(200).json({
      success: true,
      analysisId: savedSnapshot._id,
      source: gapResult.source,
      data: analysisData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student's most recent skill analysis
 * GET /api/skill-analysis/me
 */
exports.getMySkillAnalysis = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const latestAnalysis = await SkillAnalysis.findOne({ student: studentId })
      .sort({ createdAt: -1 })
      .populate('targetRole');

    if (!latestAnalysis) {
      return res.status(200).json({
        success: true,
        hasAnalysis: false,
        message: 'No previous skill analysis found. Please run a skill gap analysis.',
      });
    }

    res.status(200).json({
      success: true,
      hasAnalysis: true,
      analysis: latestAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get specific skill analysis snapshot by ID
 * GET /api/skill-analysis/:id
 */
exports.getSkillAnalysisById = async (req, res, next) => {
  try {
    const analysis = await SkillAnalysis.findById(req.params.id).populate('targetRole');

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis record not found.',
      });
    }

    if (analysis.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this analysis record.',
      });
    }

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    next(error);
  }
};
