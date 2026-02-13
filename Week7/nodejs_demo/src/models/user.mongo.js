const { connectToDb } = require('./db')
const { ObjectId } = require('mongodb')

const UserModel = {
   async createUser(user) {
    const db = await connectToDb();
    const collection = db.collection('users');
    const result = await collection.insertOne(user);
    return result.ops[0];
  },

   async insertUser(user) {
    const db = await connectToDb();
    const collection = db.collection('users');
    const result = await collection.insertOne(user);
    console.log('user.mongo.insertUser -> insertedId:', result.insertedId)
    return result;
  },

   async findUserByUsername(username) {
    const db = await connectToDb();
    const collection = db.collection('users');
    const user = await collection.findOne({ username });
    return user;
  },

   async updateUserById(id, update) {
    const db = await connectToDb();
    const collection = db.collection('users');
    // Try Mongo _id, then custom `id`, then username
    let filter = null
    // try as ObjectId
    try {
      filter = { _id: new ObjectId(id) }
      let result = await collection.updateOne(filter, { $set: update })
      if (result && result.modifiedCount > 0) return true
    } catch (e) {
      // ignore parse errors
    }

    // try custom id field
    let result = await collection.updateOne({ id }, { $set: update })
    if (result && result.modifiedCount > 0) return true

    // try username fallback
    result = await collection.updateOne({ username: id }, { $set: update })
    return result && result.modifiedCount > 0
  },

   async findUserById(id) {
    const db = await connectToDb();
    const collection = db.collection('users');
    // try Mongo _id
    try {
      const byOid = await collection.findOne({ _id: new ObjectId(id) })
      if (byOid) return byOid
    } catch (e) {
      // ignore
    }

    // try custom id field
    let user = await collection.findOne({ id })
    if (user) return user

    // try username fallback
    user = await collection.findOne({ username: id })
    return user
  },

   async deleteUserById(id) {
    const db = await connectToDb();
    const collection = db.collection('users');
    // Try Mongo _id, then custom `id`, then username
    try {
      const result = await collection.deleteOne({ _id: new ObjectId(id) })
      if (result && result.deletedCount > 0) return true
    } catch (e) {
      // ignore
    }

    let result = await collection.deleteOne({ id })
    if (result && result.deletedCount > 0) return true

    result = await collection.deleteOne({ username: id })
    return result && result.deletedCount > 0
  },

  // Convenience methods expected by controllers
  async delUser(id) {
    return this.deleteUserById(id)
  },

  async updateUser(update, id) {
    return this.updateUserById(id, update)
  },

  async getAllUsers() {
    try {
        const db = await connectToDb();
        const users = db.collection('users');
    const allUsers = await users.find({}).toArray();
    // Normalize documents so views and client code can rely on an `id` and `gender` field
    return allUsers.map(u => ({
      ...u,
      id: u.id || (u._id ? u._id.toString() : undefined),
      gender: u.gender || ''
    }));
    } catch (error) {
        console.error('Error retrieving users:', error);
    }
}
}

module.exports = UserModel;