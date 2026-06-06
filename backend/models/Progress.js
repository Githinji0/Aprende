const mongoose = require('mongoose');

const mistakeSchema = new mongoose.Schema({
  quizId: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  userAnswer: {
    type: String,
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['spelling', 'pronunciation', 'multiple-choice'],
    required: true,
  },
});

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  score: {
    type: Number,
    default: 0,
  },
  mistakes: [mistakeSchema],
}, {
  timestamps: true,
});

// Ensure a single progress record per user and lesson
progressSchema.index({ user: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
