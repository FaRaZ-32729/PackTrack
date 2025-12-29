const { mongoose } = require("mongoose");

const organizationSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        }

    },
    { timestamps: true }
);

const organizationModel = mongoose.model("organization", organizationSchema);

module.exports = organizationModel;