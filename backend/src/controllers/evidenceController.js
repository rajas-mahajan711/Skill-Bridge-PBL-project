const fs = require('fs');
const path = require('path');
const Evidence = require('../models/Evidence');

/**
 * Get all evidence items belonging to current student
 * GET /api/evidence
 */
exports.getEvidenceList = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { type, verificationStatus, search } = req.query;

    const query = { student: studentId };

    if (type && type !== 'all') {
      query.type = type;
    }

    if (verificationStatus && verificationStatus !== 'all') {
      query.verificationStatus = verificationStatus;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { relatedSkills: searchRegex },
        { source: searchRegex },
      ];
    }

    const evidenceItems = await Evidence.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: evidenceItems.length,
      evidence: evidenceItems,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single evidence item by ID (enforcing ownership)
 * GET /api/evidence/:id
 */
exports.getEvidenceById = async (req, res, next) => {
  try {
    const evidence = await Evidence.findById(req.params.id);

    if (!evidence) {
      return res.status(404).json({
        success: false,
        message: 'Evidence record not found.',
      });
    }

    // Ownership verification
    if (evidence.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this evidence record.',
      });
    }

    res.status(200).json({
      success: true,
      evidence,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new evidence record
 * POST /api/evidence
 */
exports.createEvidence = async (req, res, next) => {
  try {
    const {
      title,
      type,
      description,
      source,
      sourceUrl,
      relatedSkills,
      score,
      evidenceDate,
      connectionStatus,
      fileRef,
    } = req.body;

    if (!title || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title and evidence type are required fields.',
      });
    }

    // Process skills
    let parsedSkills = [];
    if (Array.isArray(relatedSkills)) {
      parsedSkills = relatedSkills.map((s) => s.trim()).filter(Boolean);
    } else if (typeof relatedSkills === 'string') {
      parsedSkills = relatedSkills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    // Status: student-submitted records start unverified unless verified by integrated assessment
    let verificationStatus = 'unverified';
    if (type === 'assessment' && score !== undefined && score !== null) {
      verificationStatus = 'verified';
    }

    // Connection status determination
    let connStatus = 'not_connected';
    if (sourceUrl && sourceUrl.trim()) {
      connStatus = 'url_added';
    }
    if (connectionStatus) {
      connStatus = connectionStatus;
    }

    const evidence = await Evidence.create({
      student: req.user._id,
      title: title.trim(),
      type,
      description: description ? description.trim() : '',
      source: source ? source.trim() : '',
      sourceUrl: sourceUrl ? sourceUrl.trim() : '',
      relatedSkills: parsedSkills,
      score: score !== undefined && score !== '' ? Number(score) : null,
      verificationStatus,
      connectionStatus: connStatus,
      evidenceDate: evidenceDate ? new Date(evidenceDate) : new Date(),
      fileRef: fileRef || null,
    });

    res.status(201).json({
      success: true,
      message: 'Evidence record created successfully.',
      evidence,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update permitted metadata on existing evidence
 * PATCH /api/evidence/:id
 */
exports.updateEvidence = async (req, res, next) => {
  try {
    const evidence = await Evidence.findById(req.params.id);

    if (!evidence) {
      return res.status(404).json({
        success: false,
        message: 'Evidence record not found.',
      });
    }

    // Ownership check
    if (evidence.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this evidence record.',
      });
    }

    const {
      title,
      type,
      description,
      source,
      sourceUrl,
      relatedSkills,
      evidenceDate,
    } = req.body;

    if (title !== undefined) evidence.title = title.trim();
    if (type !== undefined) evidence.type = type;
    if (description !== undefined) evidence.description = description.trim();
    if (source !== undefined) evidence.source = source.trim();
    if (sourceUrl !== undefined) {
      evidence.sourceUrl = sourceUrl.trim();
      evidence.connectionStatus = sourceUrl.trim() ? 'url_added' : 'not_connected';
    }

    if (relatedSkills !== undefined) {
      if (Array.isArray(relatedSkills)) {
        evidence.relatedSkills = relatedSkills.map((s) => s.trim()).filter(Boolean);
      } else if (typeof relatedSkills === 'string') {
        evidence.relatedSkills = relatedSkills.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    if (evidenceDate !== undefined) {
      evidence.evidenceDate = new Date(evidenceDate);
    }

    await evidence.save();

    res.status(200).json({
      success: true,
      message: 'Evidence record updated successfully.',
      evidence,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete evidence record and any associated private file
 * DELETE /api/evidence/:id
 */
exports.deleteEvidence = async (req, res, next) => {
  try {
    const evidence = await Evidence.findById(req.params.id);

    if (!evidence) {
      return res.status(404).json({
        success: false,
        message: 'Evidence record not found.',
      });
    }

    // Ownership check
    if (evidence.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this evidence record.',
      });
    }

    // Remove file from disk if present
    if (evidence.fileRef && evidence.fileRef.uploadPath) {
      try {
        if (fs.existsSync(evidence.fileRef.uploadPath)) {
          fs.unlinkSync(evidence.fileRef.uploadPath);
        }
      } catch (fileErr) {
        console.warn(`[Evidence] Failed to delete file on disk: ${fileErr.message}`);
      }
    }

    await Evidence.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Evidence record deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Secure file upload endpoint for resume/certificates
 * POST /api/evidence/upload
 */
exports.uploadEvidenceFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file was uploaded or file type is not supported.',
      });
    }

    const fileRefData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadPath: req.file.path,
    };

    // If attaching directly to an existing evidence record
    const { evidenceId } = req.body;
    if (evidenceId) {
      const evidence = await Evidence.findById(evidenceId);
      if (evidence) {
        if (evidence.student.toString() !== req.user._id.toString()) {
          // Delete uploaded temp file to prevent orphaned storage
          fs.unlinkSync(req.file.path);
          return res.status(403).json({
            success: false,
            message: 'You are not authorized to attach files to this evidence record.',
          });
        }
        evidence.fileRef = fileRefData;
        await evidence.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'File uploaded and secured successfully.',
      fileRef: {
        filename: fileRefData.filename,
        originalName: fileRefData.originalName,
        mimeType: fileRefData.mimeType,
        size: fileRefData.size,
        uploadPath: fileRefData.uploadPath,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Secure file download endpoint with ownership check
 * GET /api/evidence/:id/download
 */
exports.downloadEvidenceFile = async (req, res, next) => {
  try {
    const evidence = await Evidence.findById(req.params.id);

    if (!evidence || !evidence.fileRef) {
      return res.status(404).json({
        success: false,
        message: 'No file attachment found for this evidence record.',
      });
    }

    // Ownership check
    if (evidence.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to download this file.',
      });
    }

    const filePath = evidence.fileRef.uploadPath;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File no longer exists on storage server.',
      });
    }

    res.download(filePath, evidence.fileRef.originalName);
  } catch (error) {
    next(error);
  }
};
