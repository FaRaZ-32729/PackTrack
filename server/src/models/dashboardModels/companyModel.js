const mongoose = require("mongoose");

const companySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, { timestamps: true });

const companyModel = mongoose.model("company", companySchema);

module.exports = companyModel;