const categoryModel = require("../../models/dashboardModels/categoryModel");
const fs = require("fs");
const path = require("path");

const registerCategory = async (req, res) => {
    try {
        let { name } = req.body;
        const image = req.file;

        if (!name) return res.status(400).json({ message: "Category Name is required" });
        if (!image) return res.status(400).json({ message: "Category Image is required" });

        name = name.trim().toLowerCase();

        const existingCategory = await categoryModel.findOne({ name });
        if (existingCategory) return res.status(400).json({ message: "Category already exists" });

        const newCategory = await categoryModel.create({
            name,
            image: `/images/${image.filename}`,
        });

        return res
            .status(201)
            .json({ message: "Category registered successfully", newCategory });
    } catch (error) {
        console.log("Error while creating the category:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const getSingleCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Category ID is required" });
        }

        const category = await categoryModel.findById(id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        return res.status(200).json({
            message: "Category fetched successfully",
            category,
        });
    } catch (error) {
        console.error("Error while fetching single category:", error.message);
        return res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

const getAllCategories = async (req, res) => {
    try {
        const allCategories = await categoryModel.find();
        if (!allCategories) {
            return res.status(404).json({ message: "Categories not found " })
        }
        return res.status(200).json({ message: "Categories Fetched Successfully", Categories: allCategories });

    } catch (error) {
        console.log("error while fetching the categories");
        return res.status(500).json({ message: "Server Error", error: error.message })
    }
}

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        let { name } = req.body;
        const image = req.file; // new uploaded image (if any)

        if (!id) return res.status(400).json({ message: "Category ID is required" });

        const existingCategory = await categoryModel.findById(id);
        if (!existingCategory)
            return res.status(404).json({ message: "Category not found" });

        // If name is provided, update it
        if (name) {
            name = name.trim().toLowerCase();
            existingCategory.name = name;
        }

        // If a new image is uploaded, replace the old one
        if (image) {
            // Construct old image path
            const oldImagePath = path.join(__dirname, "../../", existingCategory.image);
            console.log(oldImagePath)

            // Delete old image file if it exists
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
                console.log("🗑️ Old image deleted:", oldImagePath);
            }

            // Set new image path
            existingCategory.image = `/images/${image.filename}`;
        }

        // Save updates
        await existingCategory.save();

        return res.status(200).json({
            message: "Category updated successfully",
            Category: existingCategory,
        });
    } catch (error) {
        console.error("Error while updating the category:", error);
        return res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await categoryModel.findById(id);
        if (!category)
            return res.status(404).json({ message: "Category Not Found" });

        // Delete the image file if it exists
        const imagePath = path.join(__dirname, "../../", category.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log(`🗑️ Deleted image file: ${imagePath}`);
        }

        // Delete category document from DB
        await categoryModel.findByIdAndDelete(id);

        return res
            .status(200)
            .json({ message: "Category and image deleted successfully" });
    } catch (error) {
        console.error("Error while deleting category:", error);
        return res
            .status(500)
            .json({ message: "Server Error", error: error.message });
    }
};

module.exports = { registerCategory, getAllCategories, updateCategory, deleteCategory, getSingleCategory }