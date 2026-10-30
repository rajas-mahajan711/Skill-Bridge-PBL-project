const LearningResource = require('../models/LearningResource');
const LearningProgress = require('../models/LearningProgress');

/**
 * Get all available learning resources
 * GET /api/learning/resources
 */
exports.getResources = async (req, res, next) => {
  try {
    const { skill, difficulty, search } = req.query;
    const studentId = req.user._id;

    const query = {};

    if (skill && skill !== 'all') {
      query.targetSkills = { $in: [new RegExp(skill.trim(), 'i')] };
    }

    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { targetSkills: searchRegex },
        { sourceName: searchRegex },
      ];
    }

    const resources = await LearningResource.find(query).sort({ title: 1 });

    // Fetch student's progress records for these resources
    const progressRecords = await LearningProgress.find({ student: studentId });
    const progressMap = {};
    progressRecords.forEach((p) => {
      progressMap[p.resource.toString()] = p;
    });

    const resourcesWithStatus = resources.map((r) => {
      const p = progressMap[r._id.toString()];
      return {
        ...r.toJSON(),
        studentProgress: p
          ? {
              id: p._id,
              status: p.status,
              progressPercentage: p.progressPercentage,
              startDate: p.startDate,
              completedDate: p.completedDate,
            }
          : {
              id: null,
              status: 'recommended',
              progressPercentage: 0,
              startDate: null,
              completedDate: null,
            },
      };
    });

    res.status(200).json({
      success: true,
      count: resourcesWithStatus.length,
      resources: resourcesWithStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current student's learning progress
 * GET /api/learning/progress
 */
exports.getProgress = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const progressList = await LearningProgress.find({ student: studentId })
      .populate('resource')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: progressList.length,
      progress: progressList,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Start or enroll in a learning resource
 * POST /api/learning/progress
 */
exports.startOrUpdateProgress = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { resourceId, status, progressPercentage } = req.body;

    if (!resourceId) {
      return res.status(400).json({
        success: false,
        message: 'resourceId is required.',
      });
    }

    const resource = await LearningResource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Learning resource not found.',
      });
    }

    let progress = await LearningProgress.findOne({
      student: studentId,
      resource: resourceId,
    });

    const newStatus = status || 'in_progress';
    const newPercentage = progressPercentage !== undefined ? Number(progressPercentage) : 0;

    if (!progress) {
      progress = await LearningProgress.create({
        student: studentId,
        resource: resourceId,
        status: newStatus,
        progressPercentage: newPercentage,
        startDate: new Date(),
        completedDate: newStatus === 'completed' ? new Date() : null,
      });
    } else {
      progress.status = newStatus;
      if (progressPercentage !== undefined) {
        progress.progressPercentage = newPercentage;
      }
      if (newStatus === 'completed' && !progress.completedDate) {
        progress.completedDate = new Date();
        progress.progressPercentage = 100;
      }
      await progress.save();
    }

    const populated = await LearningProgress.findById(progress._id).populate('resource');

    res.status(200).json({
      success: true,
      message: 'Learning progress updated successfully.',
      progress: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update learning progress by ID
 * PATCH /api/learning/progress/:id
 */
exports.updateProgressById = async (req, res, next) => {
  try {
    const progress = await LearningProgress.findById(req.params.id);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Learning progress record not found.',
      });
    }

    // Ownership check
    if (progress.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this learning progress record.',
      });
    }

    const { status, progressPercentage, notes } = req.body;

    if (status !== undefined) {
      progress.status = status;
      if (status === 'completed') {
        progress.progressPercentage = 100;
        if (!progress.completedDate) {
          progress.completedDate = new Date();
        }
      } else if (status === 'in_progress' && !progress.startDate) {
        progress.startDate = new Date();
      }
    }

    if (progressPercentage !== undefined) {
      const pct = Math.min(Math.max(Number(progressPercentage), 0), 100);
      progress.progressPercentage = pct;
      if (pct === 100 && progress.status !== 'completed') {
        progress.status = 'completed';
        progress.completedDate = new Date();
      }
    }

    if (notes !== undefined) {
      progress.notes = notes.trim();
    }

    await progress.save();
    const populated = await LearningProgress.findById(progress._id).populate('resource');

    res.status(200).json({
      success: true,
      message: 'Learning progress record updated.',
      progress: populated,
    });
  } catch (error) {
    next(error);
  }
};
