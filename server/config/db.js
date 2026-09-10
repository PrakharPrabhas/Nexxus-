const mongoose = require("mongoose");


// =====================================
// CONNECT TO MONGODB ATLAS
// =====================================

const connectDB = async () => {

    try {

        console.log("Connecting to MongoDB Atlas...");

        await mongoose.connect(
            process.env.MONGODB_URI,
            {
                serverSelectionTimeoutMS: 15000
            }
        );

        console.log("MongoDB connected successfully ☁️");

    } catch (error) {

        console.error("MongoDB connection failed ❌");
        console.error(error.message);

        throw error;
    }
};


module.exports = connectDB;