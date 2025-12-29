const userModel = require("../models/userModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")


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


// const registerUser = async (req, res) => {
//     try {
//         const { name, email, password, organizationId, managerId, role } = req.body;

//         const passwordRegex =
//             /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

//         if (!passwordRegex.test(password)) {
//             return res.status(400).json({
//                 message:
//                     "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.",
//             });
//         }


//         const creator = req.authanticatedUser;


//         if (role === "manager") {
//             if (creator.role !== "admin") {
//                 return res.status(403).json({ message: "Only Admin can create Managers" });
//             }
//         } else if (role === "user" || role === "sub-manager") {
//             if (creator.role !== "manager") {
//                 return res.status(403).json({ message: "Only Manager can create Users and sub-manager" });
//             }
//         } else {
//             return res.status(400).json({ message: "Invalid role" });
//         }

//         if (role === "manager") {
//             if (!name || !email || !password || !organizationId) {
//                 return res.status(400).json({ message: "All fields are required for manager" });
//             }
//         }
//         if (role === "sub-manager") {
//             if (!name || !email || !password || !organizationId || !managerId) {
//                 return res.status(400).json({ message: "All fields are required for sub-manager" });
//             }
//         }

//         if (role === "user") {
//             if (!name || !email || !password || !managerId) {
//                 return res.status(400).json({ message: "All fields are required for user" });
//             }
//         }

//         const existingUser = await userModel.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ message: "User already exists" });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const newUser = await userModel.create({
//             name,
//             email,
//             password: hashedPassword,
//             organizationId: (role === "manager" || role === "sub-manager") ? organizationId : null,
//             managerId: (role === "user" || role === "sub-manager") ? managerId : null,
//             role
//         });

//         return res.status(201).json({
//             message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
//             user: {
//                 _id: newUser._id,
//                 name: newUser.name,
//                 email: newUser.email,
//                 role: newUser.role,
//                 organizationId: newUser.organizationId,
//                 managerId: newUser.managerId
//             }
//         });

//     } catch (error) {
//         console.error("Register Error:", error);
//         return res.status(500).json({
//             message: "Error occurred while registering the user",
//             error: error.message
//         });
//     }
// };

const registerUser = async (req, res) => {
    try {
        const { name, email, password, organizationId, role } = req.body;
        const creator = req.authenticatedUser;

        //  sub-manager & user cannot create anyone
        if (!["admin", "manager"].includes(creator.role)) {
            return res.status(403).json({ message: "You are not allowed to create users" });
        }

        // Role permission check
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

        // Manager-specific validation
        if (role === "manager") {
            if (!organizationId) {
                return res.status(400).json({
                    message: "organizationId is required for manager",
                });
            }

            // ✅ CHECK: One manager per organization
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

        // Check if user already exists
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
            organizationId: role === "manager" ? organizationId : null,
            managerId: creator.role === "manager" ? creator._id : null,
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

    console.log(req.body);

    try {
        const existingUser = await userModel.findOne({ email });
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


module.exports = { registerUser, logInUser, logOutUser, adminRegistration };
