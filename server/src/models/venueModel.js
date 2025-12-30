const { default: mongoose, mongo } = require("mongoose");

const venueSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organization",
        required: true
    }

}, { timestamps: true });

const venueModel = mongoose.model("venue", venueSchema);

module.exports = venueModel;