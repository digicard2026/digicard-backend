const mongoose = require("mongoose");
require("dotenv").config(); 



const connectDB = async () => {
    try {
        console.log(process.env.DB_URL);
        const conn = await mongoose.connect(process.env.DB_URL);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

module.exports = connectDB;