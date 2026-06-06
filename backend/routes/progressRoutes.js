const express = require('express');
const router = express.Router();
const { getProgress, completeLesson } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getProgress);
router.post('/complete', protect, completeLesson);

module.exports = router;
