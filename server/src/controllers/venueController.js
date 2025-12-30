const organizationModel = require("../models/organizationModel");
const venueModel = require("../models/venueModel");


// const createVenue = async (req, res) => {
//     try {
//         const { name, address, organizationId } = req.body;

//         if (!name) return res.status(400).json({ message: "Name is required" });
//         if (!organizationId) return res.status(400).json({ message: "Organization Id is required" });

//         const existingOrg = await organizationModel.findById(organizationId);
//         if (!existingOrg) return res.status(404).json({ message: "Organization not found" });

//         const newVenue = await venueModel.create({ name, address, organizationId });
//         return res.status(201).json({
//             message: "Venue created successfully",
//             venue: newVenue,
//         });
//     } catch (error) {
//         console.error("Error while creating venue:", error);
//         return res.status(500).json({ message: "Error Creating Venue" });
//     }
// };


const createVenue = async (req, res) => {
    try {
        const { name, address, organizationId } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        if (!organizationId) {
            return res.status(400).json({ message: "Organization Id is required" });
        }

        const existingOrg = await organizationModel.findById(organizationId);
        if (!existingOrg) {
            return res.status(404).json({ message: "Organization not found" });
        }

        // Check duplicate venue name in same organization
        const existingVenue = await venueModel.findOne({
            name: name.trim(),
            organizationId,
        });

        if (existingVenue) {
            return res.status(400).json({
                message: "Venue with this name already exists in this organization",
            });
        }

        const newVenue = await venueModel.create({
            name: name.trim(),
            address,
            organizationId,
        });

        return res.status(201).json({
            message: "Venue created successfully",
            venue: newVenue,
        });
    } catch (error) {
        console.error("Error while creating venue:", error);
        return res.status(500).json({ message: "Error Creating Venue" });
    }
};


const getAllVenues = async (req, res) => {
    try {
        const venues = await venueModel.find().populate("orgId", "name");
        return res.status(200).json({
            count: venues.length,
            venues,
        });
    } catch (error) {
        console.error("Error while fetching all venues:", error);
        return res.status(500).json({ message: "Error Fetching Venues" });
    }
};

const getVenueByOrg = async (req, res) => {
    try {
        const { id } = req.params;
        const venues = await venueModel.find({ organizationId: id }).populate("organizationId", "name");

        if (!venues || venues.length === 0)
            return res.status(404).json({ message: "No venues found for this organization" });

        return res.status(200).json({
            count: venues.length,
            venues,
        });
    } catch (error) {
        console.error("Error while fetching venue:", error);
        return res.status(500).json({ message: "Error Fetching Venue" });
    }
};

const updateVenue = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, organizationId } = req.body;
        const loggedInUser = req.user;

        const venue = await venueModel.findById(id);
        if (!venue) {
            return res.status(404).json({ message: "Venue not found" });
        }

        /* ---------------- ROLE CHECK ---------------- */

        // Only admin can change organizationId
        if (organizationId && loggedInUser.role !== "admin") {
            return res.status(403).json({
                message: "Only admin can change organization",
            });
        }

        /* ---------------- ORGANIZATION VALIDATION ---------------- */

        if (organizationId) {
            const orgExists = await organizationModel.findById(organizationId);
            if (!orgExists) {
                return res.status(404).json({
                    message: "Organization not found",
                });
            }

            venue.organizationId = organizationId;
        }

        /* ---------------- UPDATE FIELDS ---------------- */

        if (name) {
            venue.name = name.trim();
        }

        if (address) {
            venue.address = address;
        }

        const updatedVenue = await venue.save();

        return res.status(200).json({
            message: "Venue updated successfully",
            venue: updatedVenue,
        });

    } catch (error) {
        console.error("Error while updating venue:", error);
        return res.status(500).json({ message: "Error Updating Venue" });
    }
};

const deleteVenue = async (req, res) => {
    try {
        const { id } = req.params;

        const venue = await venueModel.findById(id);
        if (!venue) return res.status(404).json({ message: "Venue not found" });

        await venue.deleteOne();

        return res.status(200).json({ message: "Venue deleted successfully" });
    } catch (error) {
        console.error("Error while deleting venue:", error);
        return res.status(500).json({ message: "Error Deleting Venue" });
    }
};

module.exports = {
    createVenue,
    getAllVenues,
    getVenueByOrg,
    updateVenue,
    deleteVenue,
};
