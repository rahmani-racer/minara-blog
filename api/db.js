const mongoose = require('mongoose');

// Global cache for MongoDB connection to avoid reconnecting on every request
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient && mongoose.connection.readyState >= 1) {
    return cachedClient;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    cachedClient = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s to prevent hanging
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
    });
    console.log('MongoDB connected successfully');
    return cachedClient;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

module.exports = { connectToDatabase };
