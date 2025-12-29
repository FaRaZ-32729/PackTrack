const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("db connected successfully");
    } catch (error) {
        console.log(error);
        console.log("error while connecting with mongodbf");
    }

}

module.exports = dbConnection;