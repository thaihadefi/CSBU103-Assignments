const { MongoClient } = require('mongodb');

// Connection is read from environment variables for safety.
// Set MONGODB_URI to your Atlas connection string (e.g. mongodb+srv://user:pass@cluster0.../)
// Optionally set MONGODB_DB to choose the default database name (default: 'demo')
// Hard-coded Atlas connection for submission/testing (as requested).
// WARNING: This contains credentials in source. Remove or switch back to
// environment variables before publishing publicly.
// Load environment from .env when present
require('dotenv').config();

// Prefer environment variables; fallback to the previous hard-coded Atlas URI
const uri = process.env.MONGODB_URI || 'mongodb+srv://thaiha0308au_db_user:MItWycr5vm2tfIxJ@cluster0.21cj6zb.mongodb.net/web?retryWrites=true&w=majority';
const dbName = process.env.MONGODB_DB || 'web';

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