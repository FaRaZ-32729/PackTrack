const companyModel = require("../../models/dashboardModels/companyModel");

const registerCompany = async (req, res) => {
    try {
        let { name } = req.body;
        if (!name) return res.status(400).json({ message: "Company Name Is Required" });

        name = name.trim().toLowerCase();

        const existingCompany = await companyModel.findOne({ name });

        if (existingCompany) return res.status(400).json({ message: "Company Already Exists" });

        const newCompany = await companyModel.create({
            name
        });

        return res.status(201).json({ message: "Company Registered Successfully", NewCompany: newCompany });

    } catch (error) {
        console.log("error while creating the company");
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}


const getAllCompanies = async (req, res) => {
    try {
        const allCompnies = await companyModel.find();
        return res.status(200).json({ message: "Companies Fetched Successfully", Compnies: allCompnies });

    } catch (error) {
        console.log("error while fetching the compnies");
        return res.status(500).json({ message: "Server Error", error: error.message })
    }
}

const getSingleCompany = async (req, res) => {
    try {
        const { id } = req.params;

        const company = await companyModel.findById(id);
        if (!company) return res.status(404).json({ message: "Company Not Found" });

        return res.status(200).json({ message: "Company Fetched Successfully", company });
    } catch (error) {
        console.error("Error while fetching single company:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};


const updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        let { name } = req.body;

        if (!name) return res.status(400).json({ message: "Name Is Required" });

        name = name.trim().toLowerCase();

        const existingCompany = await companyModel.findById(id);
        if (!existingCompany) return res.status(404).json({ message: "Company Not Found" });

        existingCompany.name = name;

        await existingCompany.save();

        return res.status(200).json({ message: "Company Updated Successfully", Company: existingCompany });
    } catch (error) {
        console.log("error while updating the company");
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}


const deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;

        const company = await companyModel.findById(id);
        if (!company) return res.status(404).json({ message: "Company Not Found" });

        await companyModel.findByIdAndDelete(id);

        return res.status(200).json({ message: "Company Deleted Successfully" });
    } catch (error) {
        console.error("error while deleting company:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = { registerCompany, getAllCompanies, updateCompany, deleteCompany, getSingleCompany }