const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // మీ MongoDB URL ని .env ఫైల్ లో పెట్టాలి
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('Database Connection Failed:', error);
        process.exit(1);
    }
};

module.exports = connectDB;