const express = require("express");
const { createOrganization, getAllOrganizations, getSingleOrganization, updateOrganization, deleteOrganization, getOrgByUser } = require("../controllers/organizationController");
const roleAccess = require("../middlewares/roleMiddleware");
const router = express.Router();

router.post("/add", roleAccess("admin"), createOrganization);
router.get("/all-org", roleAccess("admin"), getAllOrganizations);
router.get("/single-org/:id", roleAccess("admin"), getSingleOrganization);
router.get("/:userId", getOrgByUser);
router.put("/update-org/:id", roleAccess("admin"), updateOrganization);
router.delete("/delete-org/:id", roleAccess("admin"), deleteOrganization);


module.exports = router;