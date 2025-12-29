const express = require("express");
const { registerCompany, getAllCompanies, updateCompany, deleteCompany, getSingleCompany } = require("../../controllers/dashboardControllers/companyController");
const router = express.Router();

router.post("/register", registerCompany);
router.get("/all", getAllCompanies);
router.get("/one/:id", getSingleCompany);
router.put("/update/:id", updateCompany);
router.delete("/delete/:id", deleteCompany);

module.exports = router