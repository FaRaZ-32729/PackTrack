const organizationModel = require("../models/organizationModel");
const userModel = require("../models/userModel");

const createOrganization = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name)
            return res.status(400).json({ message: "Organization name is required" });

        const existingOrganization = await organizationModel.findOne({ name });
        if (existingOrganization)
            return res.status(400).json({ message: "Organization already exists" });

        const newOrganization = await organizationModel.create({ name, description });

        return res.status(201).json({
            message: "New organization created successfully",
            organization: newOrganization,
        });
    } catch (error) {
        console.error("Error while creating organization:", error.message);
        return res.status(500).json({ message: "Error creating organization" });
    }
};

const getAllOrganizations = async (req, res) => {
    try {
        const organizations = await organizationModel.find().sort({ createdAt: -1 });

        if (!organizations.length)
            return res.status(404).json({ message: "No organizations found" });

        return res.status(200).json({ organizations });
    } catch (error) {
        console.error("Error fetching organizations:", error.message);
        return res.status(500).json({ message: "Error fetching organizations" });
    }
};

const getSingleOrganization = async (req, res) => {
    try {
        const { id } = req.params;

        const organization = await organizationModel.findById(id);
        if (!organization)
            return res.status(404).json({ message: "Organization not found" });

        return res.status(200).json({ organization });
    } catch (error) {
        console.error("Error fetching organization:", error.message);
        return res.status(500).json({ message: "Error fetching organization" });
    }
};

const getOrgByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ message: "User Id Required" });

        const user = await userModel.findById(userId).select("-_id -name -email -venues -setupToken  -role -managerId -isActive -isVerified").populate("organizationId", "name");

        if (!user) return res.status(404).json({ message: "User Not Found" });

        if (!user.organizationId || user.organizationId === null) {
            return res.status(404).json({ message: "Organization Not Found" })
        }

        const userOrg = user.organizationId

        return res.status(200).json({ message: "Organization Fetched Successfully", userOrg })

    } catch (error) {
        console.log("error while getting org by userId");
        return res.status(500).json({ message: "Server Error" });
    }
}

const updateOrganization = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const organization = await organizationModel.findById(id);
        if (!organization)
            return res.status(404).json({ message: "Organization not found" });

        if (name && name !== organization.name) {
            const existing = await organizationModel.findOne({ name });
            if (existing)
                return res.status(400).json({ message: "Organization name already exists" });
        }

        organization.name = name || organization.name;
        organization.description = description || organization.description;

        const updatedOrganization = await organization.save();

        return res.status(200).json({
            message: "Organization updated successfully",
            organization: updatedOrganization,
        });
    } catch (error) {
        console.error("Error updating organization:", error.message);
        return res.status(500).json({ message: "Error updating organization" });
    }
};

const deleteOrganization = async (req, res) => {
    try {
        const { id } = req.params;

        const organization = await organizationModel.findByIdAndDelete(id);
        if (!organization)
            return res.status(404).json({ message: "Organization not found" });

        return res.status(200).json({ message: "Organization deleted successfully" });
    } catch (error) {
        console.error("Error deleting organization:", error.message);
        return res.status(500).json({ message: "Error deleting organization" });
    }
};

module.exports = {
    createOrganization,
    getAllOrganizations,
    getSingleOrganization,
    updateOrganization,
    deleteOrganization,
    getOrgByUser
};
