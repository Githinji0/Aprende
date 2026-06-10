require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = async () => {
  const conn = require('./config/db');
  await conn();
};
const Lesson = require('./models/Lesson');
const seedData = require('./data/seedData.json');

const authRoutes = require('./routes/authRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const progressRoutes = require('./routes/progressRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Enable CORS
app.use(cors({
  origin: '*', // For local testing, allow all origins. Can restrict in production.
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Database Connection & Auto-Seeding
connectDB().then(async () => {
  try {
    const lessonCount = await Lesson.countDocuments();
    const forceSeed = process.env.FORCE_SEED === 'true';

    if (lessonCount === 0 || lessonCount !== seedData.length || forceSeed) {
      console.log('Clearing old lessons and seeding combined (Beginner + Intermediate) curriculum...');
      await Lesson.deleteMany({});
      await Lesson.insertMany(seedData);
      console.log('Combined Spanish curriculum seeded successfully!');
    } else {
      console.log('Database already has up-to-date curriculum data. Skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
});

// Ping endpoint for keep-alive strategy (mitigating Render spin-up delay)
app.get('/api/ping', (req, res) => {
  res.status(200).json({ status: 'alive', message: 'Spanish Learner Backend is awake!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ai', aiRoutes);

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('Express Unhandled Error:', err.stack);
  res.status(500).json({
    message: 'An unexpected server error occurred. Please try again later.'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
