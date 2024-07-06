const mongoose = require('mongoose');

async function connectDB() {
  const urlMongoose = process.env.DATABASE_URL;

  try {
    await mongoose.connect(urlMongoose, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: false,
    });

    console.log('Connect DB Success');
  } catch (error) {
    console.log('Connect DB Error', error.message);
  }
}

module.exports = connectDB;
