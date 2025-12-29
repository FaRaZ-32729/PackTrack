const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");


const adminRegistration = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }


        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message:
                    "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.",
            });
        }

        const existingAdmin = await userModel.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await userModel.create({
            name,
            email,
            password: hashedPassword,
            role: "admin"
        });

        return res.status(201).json({
            message: "Admin registered successfully",
            admin: {
                _id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email,
                role: newAdmin.role
            }
        });

    } catch (error) {
        console.error("Admin Registration Error:", error);
        return res.status(500).json({
            message: "Error occurred while registering the admin",
            error: error.message
        });
    }
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, organizationId, venues } = req.body;
        const creator = req.authenticatedUser;

        // ❌ Only admin & manager can create users
        if (!["admin", "manager"].includes(creator.role)) {
            return res.status(403).json({ message: "You are not allowed to create users" });
        }

        // Role permissions
        const rolePermissions = {
            admin: ["manager"],
            manager: ["sub-manager", "user"],
        };

        if (!rolePermissions[creator.role]?.includes(role)) {
            return res.status(403).json({
                message: `${creator.role} cannot create ${role}`,
            });
        }

        // Required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Password validation
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message:
                    "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.",
            });
        }

        // Admin → Manager
        if (role === "manager") {
            if (creator.role !== "admin") {
                return res.status(403).json({ message: "Only admin can create managers" });
            }

            if (!organizationId) {
                return res.status(400).json({
                    message: "organizationId is required for manager",
                });
            }

            const existingManager = await userModel.findOne({
                role: "manager",
                organizationId,
            });

            if (existingManager) {
                return res.status(400).json({
                    message: "This organization already has a manager",
                });
            }
        }

        // Manager → User / Sub-manager
        if (["user", "sub-manager"].includes(role)) {
            if (creator.role !== "manager") {
                return res.status(403).json({
                    message: "Only manager can create users and sub-managers",
                });
            }

            if (!Array.isArray(venues) || venues.length === 0) {
                return res.status(400).json({
                    message: "At least one venue is required",
                });
            }
        }

        // Check existing user
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await userModel.create({
            name,
            email,
            password: hashedPassword,
            role,
            organizationId:
                role === "manager" ? organizationId : creator.organizationId,
            managerId:
                creator.role === "manager" ? creator._id : null,
            venues: ["user", "sub-manager"].includes(role) ? venues : [],
        });

        return res.status(201).json({
            message: `${role} created successfully`,
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });

    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({
            message: "Error occurred while registering the user",
            error: error.message,
        });
    }
};


const logInUser = async (req, res) => {
    const { email, password } = req.body;

    // console.log(req.body);

    try {
        const existingUser = await userModel.findOne({ email }).select("+password");

        if (!existingUser)
            return res.status(404).json({ message: "User not found" });

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect)
            return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { _id: existingUser._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "24h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
            // secure: process.env.NODE_ENV === "production", 
        });

        // complete user object except password
        const { password: _, ...userData } = existingUser.toObject();

        return res.status(200).json({
            message: "Login successful",
            user: userData,
            token,
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "An error occurred while logging in" });
    }
};

const logOutUser = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "strict",
        });
        return res.status(200).json({ message: "User Logout Successfully" });
    } catch (error) {
        console.log("logout error", error);
        return res.status(500).json({ message: "Error While Logging Out" })
    }
}

// verified user after login
const verifyMe = async (req, res) => {
    try {
        const user = req.user.toObject();
        // delete user.password;

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Error While Verifing User", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


module.exports = { registerUser, logInUser, logOutUser, adminRegistration, verifyMe };
