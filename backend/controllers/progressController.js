const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const User = require('../models/User');

// @desc    Get user's progress for all lessons
// @route   GET /api/progress
// @access  Private
const getProgress = async (req, res) => {
  try {
    const progressList = await Progress.find({ user: req.user.id });
    res.json(progressList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save progress and update user stats (XP & streak)
// @route   POST /api/progress/complete
// @access  Private
const completeLesson = async (req, res) => {
  const { lessonId, score, mistakes } = req.body;

  try {
    if (!lessonId) {
      return res.status(400).json({ message: 'Lesson ID is required' });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // --- STREAK CALCULATION ON LESSON COMPLETION ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streakUpdated = false;

    if (!user.lastActiveDate) {
      user.streak = 1;
      streakUpdated = true;
    } else {
      const lastActive = new Date(user.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      const diffTime = today - lastActive;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 2) {
        // Streak was broken; starting fresh
        user.streak = 1;
        streakUpdated = true;
      } else if (diffDays === 1) {
        // Active yesterday, so completing a lesson today increments streak
        user.streak += 1;
        streakUpdated = true;
      } else if (diffDays === 0) {
        // Active today, maintain streak (no double-incrementing)
        streakUpdated = true;
      }
    }

    // Update last active date to today
    user.lastActiveDate = new Date();

    // Award XP (if not completed before, or award partial for repeat? Let's check if already completed)
    const existingProgress = await Progress.findOne({ user: user._id, lesson: lessonId });
    const isFirstTimeCompletion = !existingProgress || !existingProgress.completed;

    if (isFirstTimeCompletion) {
      user.xp += lesson.xpReward || 10;
    }

    await user.save();

    // Upsert Progress Record
    let progress;
    if (existingProgress) {
      progress = existingProgress;
      progress.completed = true;
      progress.score = Math.max(progress.score, score || 0);
      
      // Merge mistakes
      if (mistakes && mistakes.length > 0) {
        // Combine mistakes, keeping unique quiz IDs or replacing them
        progress.mistakes = mistakes;
      }
    } else {
      progress = new Progress({
        user: user._id,
        lesson: lessonId,
        completed: true,
        score: score || 0,
        mistakes: mistakes || [],
      });
    }

    await progress.save();

    res.json({
      message: 'Progress saved successfully',
      xp: user.xp,
      streak: user.streak,
      lastActiveDate: user.lastActiveDate,
      progress,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProgress,
  completeLesson,
};
