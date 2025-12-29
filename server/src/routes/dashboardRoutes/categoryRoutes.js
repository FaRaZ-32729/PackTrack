const express = require("express");
const { registerCategory, getAllCategories, updateCategory, deleteCategory, getSingleCategory } = require("../../controllers/dashboardControllers/categoryController");
const upload = require("../../middlewares/upload");
const router = express.Router();

router.post("/register", upload.single("image"), registerCategory);
router.get("/all", getAllCategories);
router.get("/one/:id", getSingleCategory);
router.put("/update/:id", upload.single("image"), updateCategory);
router.delete("/delete/:id", deleteCategory);

module.exports = router