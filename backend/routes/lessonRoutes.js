const express = require('express');
const router = express.Router();
const { getLessons, getLessonById } = require('../controllers/lessonController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getLessons);
router.get('/:id', protect, getLessonById);

module.exports = router;
