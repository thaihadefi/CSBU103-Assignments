const { connectToDb, closeDb } = require('../src/models/db');

async function run() {
  const db = await connectToDb();
  try {
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    console.log('Created unique index on users.username');
  } catch (err) {
    console.error('Error creating index:', err);
  } finally {
    await closeDb();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
