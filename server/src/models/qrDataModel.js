const mongoose  = require("mongoose");

const qrDataSchema = mongoose.Schema(
    {
        company: { type: String, required: true },
        category: { type: String, required: true },
        bottles: { type: String, required: true },
        truckNumber: { type: String, required: true },
    },
    { timestamps: true }
);
const qrDataModel = mongoose.model("qrcodedata", qrDataSchema);

module.exports = qrDataModel;
