const { default: mongoose } = require("mongoose");

const cameraSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rtspUrl: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ["box", "number plate"]
    },
    venueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "venue",
        required: true
    }
}, { timestamps: true });

const cameraModel = mongoose.model("camera", cameraSchema);

module.exports = cameraModel;