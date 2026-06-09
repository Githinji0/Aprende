const Lesson = require('../models/Lesson');

// @desc    Get all lessons
// @route   GET /api/lessons
// @access  Private
const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({}).select('title difficulty description xpReward chapterNumber chapterTitle lessonOrder lessonType');
    res.json(lessons);
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ message: 'An unexpected server error occurred. Please try again later.' });
  }
};

// @desc    Get a single lesson by ID
// @route   GET /api/lessons/:id
// @access  Private
const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    res.json(lesson);
  } catch (error) {
    console.error('Get lesson by ID error:', error);
    res.status(500).json({ message: 'An unexpected server error occurred. Please try again later.' });
  }
};

module.exports = {
  getLessons,
  getLessonById,
};
