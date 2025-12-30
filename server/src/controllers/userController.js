const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const venueModel = require("../models/venueModel");

// const updateUser = async (req, res) => {
//     try {
//         const { userId } = req.params;
//         const updates = req.body;
//         const loggedInUser = req.user;

//         const targetUser = await userModel.findById(userId);
//         if (!targetUser) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         /* ---------------- ROLE CHECK ---------------- */

//         // ADMIN → can update MANAGER only
//         if (loggedInUser.role === "admin") {
//             if (targetUser.role !== "manager") {
//                 return res.status(403).json({
//                     message: "Admin can only update managers",
//                 });
//             }
//         }

//         // MANAGER → can update USER & SUB-MANAGER only
//         if (loggedInUser.role === "manager") {
//             if (!["user", "sub-manager"].includes(targetUser.role)) {
//                 return res.status(403).json({
//                     message: "Manager can only update users or sub-managers",
//                 });
//             }

//             // Extra safety: manager can update ONLY his users
//             if (
//                 targetUser.managerId?.toString() !== loggedInUser._id.toString()
//             ) {
//                 return res.status(403).json({
//                     message: "You can only update your own users",
//                 });
//             }
//         }

//         // USERS cannot update anyone
//         if (loggedInUser.role === "user") {
//             return res.status(403).json({
//                 message: "You are not allowed to update users",
//             });
//         }

//         /* ---------------- FIELD LEVEL CONTROL ---------------- */

//         const allowedFieldsByRole = {
//             admin: ["name", "email", "password", "organizationId"],
//             manager: ["name", "email", "password", "venues"],
//         };

//         const allowedFields = allowedFieldsByRole[loggedInUser.role];

//         const filteredUpdates = {};
//         for (let key of allowedFields) {
//             if (updates[key] !== undefined) {
//                 filteredUpdates[key] = updates[key];
//             }
//         }

//         /* ---------------- PASSWORD VALIDATION ---------------- */

//         if (filteredUpdates.password) {
//             const passwordRegex =
//                 /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

//             if (!passwordRegex.test(filteredUpdates.password)) {
//                 return res.status(400).json({
//                     message:
//                         "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
//                 });
//             }

//             // Hash password
//             filteredUpdates.password = await bcrypt.hash(
//                 filteredUpdates.password,
//                 10
//             );
//         }

//         /* ---------------- UPDATE ---------------- */

//         const updatedUser = await userModel.findByIdAndUpdate(
//             userId,
//             filteredUpdates,
//             { new: true }
//         );

//         res.json({
//             message: "User updated successfully",
//             user: updatedUser,
//         });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Update failed" });
//     }
// };

const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;
        const loggedInUser = req.user;

        const targetUser = await userModel.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        /* ---------------- ROLE CHECK ---------------- */

        // ADMIN → can update MANAGER only
        if (loggedInUser.role === "admin") {
            if (targetUser.role !== "manager") {
                return res.status(403).json({
                    message: "Admin can only update managers",
                });
            }
        }

        // MANAGER → can update USER & SUB-MANAGER only
        if (loggedInUser.role === "manager") {
            if (!["user", "sub-manager"].includes(targetUser.role)) {
                return res.status(403).json({
                    message: "Manager can only update users or sub-managers",
                });
            }

            // Extra safety: manager can update ONLY his users
            if (targetUser.managerId?.toString() !== loggedInUser._id.toString()) {
                return res.status(403).json({
                    message: "You can only update your own users",
                });
            }
        }

        // USERS cannot update anyone
        if (loggedInUser.role === "user") {
            return res.status(403).json({
                message: "You are not allowed to update users",
            });
        }

        /* ---------------- FIELD LEVEL CONTROL ---------------- */

        const allowedFieldsByRole = {
            admin: ["name", "email", "password", "organizationId"],
            manager: ["name", "email", "password", "venues"],
        };

        const allowedFields = allowedFieldsByRole[loggedInUser.role];
        const filteredUpdates = {};
        for (let key of allowedFields) {
            if (updates[key] !== undefined) {
                filteredUpdates[key] = updates[key];
            }
        }

        /* ---------------- PASSWORD VALIDATION ---------------- */

        if (filteredUpdates.password) {
            const passwordRegex =
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

            if (!passwordRegex.test(filteredUpdates.password)) {
                return res.status(400).json({
                    message:
                        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
                });
            }

            // Hash password
            filteredUpdates.password = await bcrypt.hash(filteredUpdates.password, 10);
        }

        /* ---------------- VENUES HANDLING ---------------- */
        if (filteredUpdates.venues && ["user", "sub-manager"].includes(targetUser.role)) {
            const venueIds = filteredUpdates.venues;

            // Validate ObjectId format
            const invalidIds = venueIds.filter((id) => !mongoose.Types.ObjectId.isValid(id));
            if (invalidIds.length > 0) {
                return res.status(400).json({ message: "Invalid venue id provided" });
            }

            // Fetch venues belonging to organization
            const foundVenues = await venueModel
                .find({
                    _id: { $in: venueIds },
                    organizationId: loggedInUser.organizationId,
                })
                .select("_id name");

            if (foundVenues.length !== venueIds.length) {
                return res.status(400).json({
                    message: "One or more venues do not belong to your organization",
                });
            }

            // Prepare venue data for subdocument
            filteredUpdates.venues = foundVenues.map((v) => ({
                venueId: v._id,
                venueName: v.name,
            }));
        }

        /* ---------------- UPDATE ---------------- */
        const updatedUser = await userModel.findByIdAndUpdate(userId, filteredUpdates, { new: true });

        res.json({
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Update failed" });
    }
};

const getAdminUsers = async (req, res) => {
    try {
        const admin = req.user;

        if (admin.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        // Find managers created under this admin's organization
        const managers = await userModel
            .find({ role: "manager" })
            .populate("organizationId", "name")
            .select("-setupToken -otp -otpExpiry"); 

        res.json({
            message: "Managers fetched successfully",
            users: managers,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch managers" });
    }
};

const getManagerUsers = async (req, res) => {
    try {
        const manager = req.user;

        if (manager.role !== "manager") {
            return res.status(403).json({ message: "Access denied" });
        }

        // Find users and sub-managers created by this manager
        const users = await userModel
            .find({ managerId: manager._id, role: { $in: ["user", "sub-manager"] } })
            .populate("organizationId", "name") 
            .populate({
                path: "venues.venueId",
                select: "name", 
            })
            .select("-setupToken -otp -otpExpiry");

        if (!users || users.length === 0) {
            return res.status(404).json({
                message: "No users or sub-managers found for this manager",
            });
        }

        res.json({
            message: "Users fetched successfully",
            users,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

module.exports = { updateUser, getAdminUsers, getManagerUsers }