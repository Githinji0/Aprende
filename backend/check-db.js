require('dotenv').config();
const mongoose = require('mongoose');
const Lesson = require('./models/Lesson');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB!");
  
  const total = await Lesson.countDocuments();
  console.log(`Total lessons in DB: ${total}`);
  
  const beginnerCount = await Lesson.countDocuments({ difficulty: 'Beginner' });
  console.log(`Beginner lessons in DB: ${beginnerCount}`);
  
  const intermediateCount = await Lesson.countDocuments({ difficulty: 'Intermediate' });
  console.log(`Intermediate lessons in DB: ${intermediateCount}`);
  
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

run().catch(console.error);
