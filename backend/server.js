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
    if (lessonCount === 0) {
      console.log('No lessons found. Seeding initial database...');
      await Lesson.insertMany(seedData);
      console.log('Initial lessons seeded successfully!');
    } else {
      console.log('Database already has lesson data. Skipping seed.');
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
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
