const StudentProfile = require('../models/StudentProfile');
const Evidence = require('../models/Evidence');
const RoleDefinition = require('../models/RoleDefinition');
const LearningProgress = require('../models/LearningProgress');
const AssessmentResult = require('../models/AssessmentResult');
const AIServiceClient = require('../services/aiServiceClient');

/**
 * Get profile of currently authenticated student
 * GET /api/students/me
 */
exports.getStudentProfile = async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user._id }).populate('targetRoleId');

    if (!profile) {
      profile = await StudentProfile.create({ user: req.user._id });
    }

    res.status(200).json({
      success: true,
      profile: {
        ...profile.toJSON(),
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update permitted profile fields for currently authenticated student
 * PUT /api/students/me
 */
exports.updateStudentProfile = async (req, res, next) => {
  try {
    const {
      headline,
      bio,
      contactNumber,
      technicalInterests,
      academic,
      socialLinks,
      targetRoleId,
    } = req.body;

    let profile = await StudentProfile.findOne({ user: req.user._id });

    if (!profile) {
      profile = new StudentProfile({ user: req.user._id });
    }

    // Update authorized fields only
    if (headline !== undefined) profile.headline = headline;
    if (bio !== undefined) profile.bio = bio;
    if (contactNumber !== undefined) profile.contactNumber = contactNumber;
    if (technicalInterests !== undefined && Array.isArray(technicalInterests)) {
      profile.technicalInterests = technicalInterests.map((s) => s.trim()).filter(Boolean);
    }

    if (academic && typeof academic === 'object') {
      profile.academic = {
        college: academic.college !== undefined ? academic.college.trim() : profile.academic.college,
        department: academic.department !== undefined ? academic.department.trim() : profile.academic.department,
        degree: academic.degree !== undefined ? academic.degree.trim() : profile.academic.degree,
        currentYear: academic.currentYear !== undefined ? Number(academic.currentYear) : profile.academic.currentYear,
        graduationYear: academic.graduationYear !== undefined ? Number(academic.graduationYear) : profile.academic.graduationYear,
        cgpa: academic.cgpa !== undefined && academic.cgpa !== '' ? Number(academic.cgpa) : profile.academic.cgpa,
      };
    }

    if (socialLinks && typeof socialLinks === 'object') {
      profile.socialLinks = {
        github: socialLinks.github !== undefined ? socialLinks.github.trim() : profile.socialLinks.github,
        linkedin: socialLinks.linkedin !== undefined ? socialLinks.linkedin.trim() : profile.socialLinks.linkedin,
        leetcode: socialLinks.leetcode !== undefined ? socialLinks.leetcode.trim() : profile.socialLinks.leetcode,
        codeforces: socialLinks.codeforces !== undefined ? socialLinks.codeforces.trim() : profile.socialLinks.codeforces,
        portfolio: socialLinks.portfolio !== undefined ? socialLinks.portfolio.trim() : profile.socialLinks.portfolio,
        otherLinks: Array.isArray(socialLinks.otherLinks) ? socialLinks.otherLinks : profile.socialLinks.otherLinks,
      };
    }

    if (targetRoleId !== undefined) {
      if (targetRoleId === '' || targetRoleId === null) {
        profile.targetRoleId = null;
      } else {
        const roleExists = await RoleDefinition.findById(targetRoleId);
        if (roleExists) {
          profile.targetRoleId = roleExists._id;
        }
      }
    }

    await profile.save();
    const updated = await StudentProfile.findById(profile._id).populate('targetRoleId');

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully.',
      profile: {
        ...updated.toJSON(),
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comprehensive student dashboard data
 * GET /api/students/me/dashboard
 */
exports.getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // 1. Fetch Profile
    let profile = await StudentProfile.findOne({ user: studentId }).populate('targetRoleId');
    if (!profile) {
      profile = await StudentProfile.create({ user: studentId });
    }

    // 2. Fetch Evidence & Assessments
    const evidenceList = await Evidence.find({ student: studentId }).sort({ createdAt: -1 });
    const assessmentList = await AssessmentResult.find({ student: studentId }).sort({ completionDate: -1 });

    // 3. Evaluate skills via AI service
    const targetSkills = profile.technicalInterests || [];
    const evaluationRes = await AIServiceClient.analyzeSkills(evidenceList, targetSkills);
    const evaluatedSkills = evaluationRes.data.skills || [];

    // 4. Role readiness (if student selected a target role, or fallback to first active role)
    let targetRole = profile.targetRoleId;
    if (!targetRole) {
      targetRole = await RoleDefinition.findOne({ active: true }).sort({ createdAt: 1 });
    }

    let roleReadiness = null;
    if (targetRole) {
      const gapRes = await AIServiceClient.analyzeSkillGaps(targetRole, evaluatedSkills);
      roleReadiness = {
        roleId: targetRole._id,
        roleTitle: targetRole.title,
        readinessScore: gapRes.data.readiness_score,
        readinessBand: gapRes.data.readiness_band,
        meetingSkills: (gapRes.data.gaps || []).filter((g) => g.status === 'meeting').map((g) => g.skill_name),
        weakSkills: (gapRes.data.gaps || []).filter((g) => g.status === 'weak').map((g) => g.skill_name),
        missingSkills: (gapRes.data.gaps || []).filter((g) => g.status === 'missing').map((g) => g.skill_name),
        calculationSummary: gapRes.data.calculation_summary,
        disclaimer: gapRes.data.disclaimer,
      };
    }

    // 5. Recommended roles matching
    const allRoles = await RoleDefinition.find({ active: true });
    const roleMatchRes = await AIServiceClient.matchRoles(evaluatedSkills, allRoles);
    const recommendedRoles = (roleMatchRes.data.recommendations || []).slice(0, 3);

    // 6. Recent activity timeline
    const recentActivity = [];
    evidenceList.slice(0, 4).forEach((e) => {
      recentActivity.push({
        id: `ev-${e._id}`,
        type: 'evidence_submission',
        title: `Added ${e.type.replace('_', ' ')}: "${e.title}"`,
        date: e.createdAt,
        status: e.verificationStatus,
      });
    });

    assessmentList.slice(0, 2).forEach((a) => {
      recentActivity.push({
        id: `as-${a._id}`,
        type: 'assessment_result',
        title: `Completed ${a.title} (Score: ${a.score}/${a.maxScore})`,
        date: a.completionDate || a.createdAt,
        status: 'verified',
      });
    });

    // 7. Learning progress summary
    const progressRecords = await LearningProgress.find({ student: studentId }).populate('resource');
    const activeResources = progressRecords.filter((p) => p.status === 'in_progress');
    const completedResources = progressRecords.filter((p) => p.status === 'completed');
    const totalResources = progressRecords.length;
    const overallProgress = totalResources > 0
      ? Math.round((completedResources.length / totalResources) * 100)
      : 0;

    // Suggest next action based on gaps or evidence count
    let suggestedNextAction = 'Upload your academic projects or complete a diagnostic assessment to build evidence.';
    if (evidenceList.length === 0) {
      suggestedNextAction = 'Start by adding your first project or certificate in the Skills & Evidence section.';
    } else if (roleReadiness && roleReadiness.missingSkills.length > 0) {
      suggestedNextAction = `Target your skill gap in ${roleReadiness.missingSkills[0]} by starting recommended learning modules.`;
    } else if (activeResources.length > 0) {
      suggestedNextAction = `Continue learning: "${activeResources[0].resource?.title || 'Active course'}" (${activeResources[0].progressPercentage}% completed).`;
    }

    res.status(200).json({
      success: true,
      profileSummary: {
        name: req.user.name,
        email: req.user.email,
        college: profile.academic?.college || 'Not specified',
        department: profile.academic?.department || 'Not specified',
        currentYear: profile.academic?.currentYear || 3,
        graduationYear: profile.academic?.graduationYear || 2026,
        completionPercentage: profile.completionPercentage || 0,
      },
      skillsOverview: {
        totalEvaluated: evaluatedSkills.filter((s) => s.status === 'evaluated').length,
        topSkills: evaluatedSkills.filter((s) => s.status === 'evaluated').slice(0, 5),
        insufficientEvidenceCount: evaluatedSkills.filter((s) => s.status === 'insufficient_evidence').length,
      },
      roleReadiness,
      recommendedRoles,
      recentActivity: recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
      learningSummary: {
        activeCount: activeResources.length,
        completedCount: completedResources.length,
        totalEnrolled: totalResources,
        progressPercentage: overallProgress,
        suggestedNextAction,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all evaluated skills with confidence and evidence breakdown
 * GET /api/students/me/skills
 */
exports.getStudentSkills = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const profile = await StudentProfile.findOne({ user: studentId });
    const evidenceList = await Evidence.find({ student: studentId });

    const targetSkills = profile?.technicalInterests || [];
    const evaluationRes = await AIServiceClient.analyzeSkills(evidenceList, targetSkills);

    res.status(200).json({
      success: true,
      skills: evaluationRes.data.skills || [],
      version: evaluationRes.data.version,
      methodology: evaluationRes.data.methodology,
    });
  } catch (error) {
    next(error);
  }
};
