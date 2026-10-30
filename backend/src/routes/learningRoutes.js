const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');
const { authenticate } = require('../middleware/auth');

router.get('/resources', authenticate, learningController.getResources);
router.get('/progress', authenticate, learningController.getProgress);
router.post('/progress', authenticate, learningController.startOrUpdateProgress);
router.patch('/progress/:id', authenticate, learningController.updateProgressById);

module.exports = router;
