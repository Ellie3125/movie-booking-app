const mongoose = require('mongoose');
const Showtime = require('./backend/src/models/Showtime');
require('dotenv').config({ path: './backend/.env' });

async function migrate() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-booking';
    console.log('Connecting to', uri);
    await mongoose.connect(uri);
    
    console.log('Updating showtimes without status...');
    const result = await Showtime.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'active' } }
    );
    
    console.log(`Updated ${result.modifiedCount} showtimes.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
