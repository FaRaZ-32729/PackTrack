const express = require("express");
const { createVenue, listVenueForSpecificOrg, getAllVenues, updateVenue, deleteVenue } = require("../controllers/venueController");
const roleAccess = require("../middlewares/roleMiddleware");
const authUser = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/add", roleAccess("admin", "manager", "sub-manager"), createVenue);
router.get("/:id", listVenueForSpecificOrg);
router.get("/all-venue", getAllVenues);
router.put("/update-venue/:id", updateVenue);
router.delete("/delete-venue/:id", deleteVenue);


module.exports = router;