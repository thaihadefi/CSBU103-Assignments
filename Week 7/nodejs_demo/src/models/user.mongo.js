const { connectToDb } = require('./db')

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
    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: update });
    return result.modifiedCount > 0;
  },

   async deleteUserById(id) {
    const db = await connectToDb();
    const collection = db.collection('users');
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  },

  async getAllUsers() {
    try {
        const db = await connectToDb();
        const users = db.collection('users');
        const allUsers = await users.find({}).toArray();
        return allUsers;
    } catch (error) {
        console.error('Error retrieving users:', error);
    }
}
}

module.exports = UserModel;