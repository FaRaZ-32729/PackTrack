const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            select: false,
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "organization",
            required: function () {
                // required if role is manager or if user/sub-manager inherits it
                return this.role === "manager";
            },
        },
        managerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: function () {
                return this.role === "user" || this.role === "sub-manager";
            },
        },
        role: {
            type: String,
            enum: ["manager", "user", "admin", "sub-manager"],
            required: true,
        },
        venues: {
            type: [
                {
                    venueId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "venue",
                        required: function () {
                            return this.role === "user" || this.role === "sub-manager";
                        },
                    },
                    venueName: {
                        type: String,
                        required: function () {
                            return this.role === "user" || this.role === "sub-manager";
                        },
                    },
                },
            ],
            default: undefined,
        },
        otp: { type: String },
        otpExpiry: { type: Date },
        setupToken: { type: String },
        isActive: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// Unique manager per organization
userSchema.index(
    { organizationId: 1 },
    { unique: true, partialFilterExpression: { role: "manager" } }
);

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;