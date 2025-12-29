const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations"
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    role: {
        type: String,
        enum: ["manager", "user", "admin", "sub-manager"],
        required: true
    }
});

// Conditional validation
userSchema.pre("validate", function (next) {
    if (this.role === "manager" && !this.organizationId) {
        return next(new Error("organizationId is required for manager"));
    }
    if (this.role === "user" && !this.managerId) {
        return next(new Error("managerId is required for user"));
    }
    next();
});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
