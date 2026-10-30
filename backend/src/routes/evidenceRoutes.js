const express = require('express');
const router = express.Router();
const evidenceController = require('../controllers/evidenceController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Base evidence CRUD
router.get('/', authenticate, evidenceController.getEvidenceList);
router.post('/', authenticate, evidenceController.createEvidence);
router.get('/:id', authenticate, evidenceController.getEvidenceById);
router.patch('/:id', authenticate, evidenceController.updateEvidence);
router.delete('/:id', authenticate, evidenceController.deleteEvidence);

// Secure upload & download
router.post('/upload', authenticate, upload.single('file'), evidenceController.uploadEvidenceFile);
router.get('/:id/download', authenticate, evidenceController.downloadEvidenceFile);

module.exports = router;
