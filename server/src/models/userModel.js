// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     password: {
//         type: String,
//         required: true
//     },
//     organizationId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "organizations"
//     },
//     managerId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "users"
//     },
//     role: {
//         type: String,
//         enum: ["manager", "user", "admin", "sub-manager"],
//         required: true
//     }
// });

// // Conditional validation
// userSchema.pre("validate", function (next) {
//     if (this.role === "manager" && !this.organizationId) {
//         return next(new Error("organizationId is required for manager"));
//     }
//     if (this.role === "user" && !this.managerId) {
//         return next(new Error("managerId is required for user"));
//     }
//     next();
// });

// const userModel = mongoose.model("users", userSchema);

// module.exports = userModel;



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
            required: true,
            select: false, // exclude password by default
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "organizations",
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
            type: mongoose.Schema.Types.ObjectId,
            ref: "venue",
            required: function () {
                return this.role === "user" || this.role === "sub-manager";
            },
            default: [],
        },
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
