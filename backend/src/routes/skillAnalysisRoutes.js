const express = require('express');
const router = express.Router();
const skillAnalysisController = require('../controllers/skillAnalysisController');
const { authenticate } = require('../middleware/auth');

// Role definitions
router.get('/roles', authenticate, skillAnalysisController.getRoles);
router.get('/roles/:id', authenticate, skillAnalysisController.getRoleById);

// Skill analysis executions and history
router.post('/skill-analysis', authenticate, skillAnalysisController.runSkillAnalysis);
router.get('/skill-analysis/me', authenticate, skillAnalysisController.getMySkillAnalysis);
router.get('/skill-analysis/:id', authenticate, skillAnalysisController.getSkillAnalysisById);

module.exports = router;
