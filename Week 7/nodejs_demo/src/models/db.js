const { MongoClient } = require('mongodb');

require('dotenv').config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'web';

if (!uri) {
  console.error('FATAL: MONGODB_URI is not set. Please create a .env file from .env.example or set the environment variable.');
  throw new Error('MONGODB_URI is required but not set');
}

let dbInstance = null;
let clientInstance = null;

async function connectToDb() {
  if (dbInstance) return dbInstance; // Return existing instance if already connected

  try {
    clientInstance = new MongoClient(uri);
    await clientInstance.connect();
    console.log('Connected to MongoDB');
    dbInstance = clientInstance.db(dbName);
    return dbInstance;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

async function closeDb() {
  if (clientInstance) {
    await clientInstance.close();
    clientInstance = null;
    dbInstance = null;
  }
}

module.exports = { connectToDb, closeDb };