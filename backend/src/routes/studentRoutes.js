const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate } = require('../middleware/auth');

router.get('/me', authenticate, studentController.getStudentProfile);
router.put('/me', authenticate, studentController.updateStudentProfile);
router.get('/me/dashboard', authenticate, studentController.getStudentDashboard);
router.get('/me/skills', authenticate, studentController.getStudentSkills);

module.exports = router;
