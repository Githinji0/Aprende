const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['multiple-choice', 'spelling', 'pronunciation'],
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: [{
    type: String, // Only used for multiple-choice quizzes
  }],
  answerKey: {
    type: String,
    required: true, // The exact correct string in Spanish
  },
  englishTranslation: {
    type: String,
  },
});

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  xpReward: {
    type: Number,
    default: 10,
  },
  chapterNumber: {
    type: Number,
    required: true,
  },
  chapterTitle: {
    type: String,
    required: true,
    trim: true,
  },
  lessonOrder: {
    type: Number,
    required: true,
  },
  lessonType: {
    type: String,
    enum: ['standard', 'speaking', 'checkpoint'],
    default: 'standard',
    required: true,
  },
  vocabulary: [{
    spanish: { type: String, required: true },
    english: { type: String, required: true },
    pronunciationHint: { type: String },
  }],
  quizzes: [quizSchema],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Lesson', lessonSchema);
