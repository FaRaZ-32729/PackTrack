const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const emails = require("../utils/emails");
const venueModel = require("../models/venueModel");
require("dotenv").config();


const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();


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
        const { name, email, role, organizationId, venues } = req.body;
        const creator = req.user;

        if (!["admin", "manager"].includes(creator.role)) {
            return res.status(403).json({ message: "You are not allowed" });
        }

        const rolePermissions = {
            admin: ["manager"],
            manager: ["sub-manager", "user"],
        };

        if (!rolePermissions[creator.role]?.includes(role)) {
            return res.status(403).json({
                message: `${creator.role} cannot create ${role}`,
            });
        }

        if (!name || !email || !role) {
            return res.status(400).json({ message: "Missing required fields" });
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

        let venueData = [];

        if (["user", "sub-manager"].includes(role)) {
            // Validate ObjectId format
            const invalidIds = venues.filter(id => !mongoose.Types.ObjectId.isValid(id));
            if (invalidIds.length > 0) {
                return res.status(400).json({
                    message: "Invalid venue id provided",
                });
            }

            //  Fetch venues belonging to organization
            const foundVenues = await venueModel.find({
                _id: { $in: venues },
                organizationId: creator.organizationId,
            }).select("_id name");

            // Check if all venues exist
            if (foundVenues.length !== venues.length) {
                return res.status(400).json({
                    message: "One or more venues do not belong to your organization",
                });
            }

            // Prepare venue data (id + name)
            venueData = foundVenues.map(v => ({
                venueId: v._id,
                venueName: v.name,
            }));
        }


        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Setup token
        const token = jwt.sign(
            { email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "24h" }
        );

        const setupLink = `http://localhost:5173/setup-password/${token}`;

        await emails(
            email,
            "Set up your Pack Track Account",
            `
            <div style="font-family: Arial, sans-serif; color: #333; background: #f5f8fa; padding: 20px; border-radius: 8px;">
                <div style="text-align: center;">
                    <img src="cid:logo.png" alt="IOTFIY Logo" style="width: 120px; margin-bottom: 20px;" />
                </div>
                <h2 style="color: #0055a5;">Welcome to Pack Track!</h2>
                <p>Hello <b>${name || email}</b>,</p>
                <p>Your account has been created. Please click below to set your password:</p>

                <div style="text-align: center; margin: 20px 0;">
                    <a href="${setupLink}"
                       style="background-color: #0055a5; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-size: 16px;">
                       Set Password
                    </a>
                </div>

                <p style="font-size: 14px; color: #555;">
                    This link will expire in 24 hours. If you didn't expect this email, ignore it.
                </p>
                <hr/>
                <p style="font-size: 12px; text-align: center; color: #888;">
                    © ${new Date().getFullYear()} IOTFIY Solutions. All rights reserved.
                </p>
            </div>
            `
        );


        // Create inactive user
        const newUser = await userModel.create({
            name,
            email,
            role,
            organizationId:
                role === "manager" ? organizationId : creator.organizationId,
            managerId:
                creator.role === "manager" ? creator._id : null,
            venues: ["user", "sub-manager"].includes(role) ? venueData : [],
            setupToken: token,
            isActive: false,
            isVerified: false,
        });


        res.status(201).json({
            message: "User created. Setup email sent.",
            user: newUser
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "User creation failed" });
    }
};

const setPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password)
        return res.status(400).json({ message: "Password is required" });

    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message:
                "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.",
        });
    };

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await userModel.findOne({
        email: decoded.email,
        setupToken: token
    });

    if (!user) {
        return res.status(400).json({ message: "Invalid or expired link" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const otp = generateOTP();
    user.password = hashed;
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    const setupLink = `http://localhost:5173/verify-otp/${token}`;

    await emails(
        user.email,
        "Verify Your Pack Track account",
        `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e6e6e6; border-radius: 8px; background-color: #ffffff;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e6e6e6;">
          <img src="cid:logo.png" alt="IOTFIY Logo" style="max-width: 150px;" />
      </div>

      <h2 style="color: #263238; margin-top: 30px;">Welcome to Pack Track!</h2>
      <p style="font-size: 14px; line-height: 1.6;">
          Hi <strong>${user.name || user.email}</strong>,
          <br><br>
          Your password has been successfully set. To complete your account setup, please use the one-time password (OTP) below to verify your email address.
      </p>

      <div style="background-color: #f4faff; border: 1px solid #cde7ff; padding: 15px; margin: 20px 0; text-align: center; font-size: 22px; letter-spacing: 3px; font-weight: bold;">
          ${otp}
      </div>

      <div style="text-align: center; margin: 25px 0;">
            <a href="${setupLink}"
                style="background-color: #0055a5; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-size: 16px;">
                Verify OTP
            </a>
      </div>

      <p style="font-size: 14px; line-height: 1.6;">
          This OTP is valid for the next <strong>10 minutes</strong>. If you didn’t request this, please ignore this email.
      </p>

      <p style="font-size: 14px; line-height: 1.6;">
          Best Regards, <br>
          <strong>LuckyOne Team</strong>
      </p>

      <div style="text-align: center; font-size: 12px; color: #777; margin-top: 30px;">
          © ${new Date().getFullYear()} IOTFIY Solutions, All rights reserved.
          <br>
          This is an automated message, please do not reply.
      </div>
  </div>
  `
    );

    res.json({ message: "Password set. OTP sent." });
};

// verify otp
const verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const { token } = req.params;

        if (!otp || !token)
            return res.status(400).json({ message: "OTP and token are required" });

        // Decode token to get email
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne({ email: decoded.email });

        if (!user) return res.status(404).json({ message: "User not found" });

        // Validate OTP
        if (user.otp !== otp)
            return res.status(400).json({ message: "Invalid OTP" });

        if (Date.now() > user.otpExpiry)
            return res.status(400).json({ message: "OTP expired" });

        // Update user status
        user.isVerified = true;
        user.isActive = true;
        user.otp = null;
        user.otpExpiry = null;
        user.setupToken = null;

        await user.save();

        return res.json({
            message: "Account verified successfully. You can now log in.",
        });
    } catch (err) {
        console.error("OTP Verification Error:", err);
        if (err.name === "TokenExpiredError") {
            return res.status(400).json({ message: "Verification link expired" });
        }
        return res.status(500).json({ message: "Error verifying OTP" });
    }
};

const logInUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await userModel.findOne({ email }).select("+password");

        if (!existingUser)
            return res.status(404).json({ message: "User not found" });

        if (!existingUser.isVerified || !existingUser.isActive) {
            return res.status(403).json({
                message: "Account not verified"
            });
        }

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


module.exports = { registerUser, logInUser, logOutUser, adminRegistration, verifyMe, setPassword, verifyOTP };
