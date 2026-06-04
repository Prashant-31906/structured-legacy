const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Apni MongoDB URI .env file me MONGO_URI variable me rakhna
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/structured_legacy');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;