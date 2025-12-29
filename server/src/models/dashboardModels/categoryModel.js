const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        image: {
            type: String, 
            required: true,
        },
    },
    { timestamps: true }
);

const categoryModel = mongoose.model("category", categorySchema);

module.exports = categoryModel;
