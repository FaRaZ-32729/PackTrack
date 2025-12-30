const express = require("express");
const { createVenue, getVenueByOrg, getAllVenues, updateVenue, deleteVenue } = require("../controllers/venueController");
const roleAccess = require("../middlewares/roleMiddleware");
const authUser = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/add", roleAccess("admin", "manager", "sub-manager"), createVenue);
router.get("/by-org/:id", roleAccess("admin", "manager", "sub-manager"), getVenueByOrg);
router.get("/all-venue",roleAccess("admin"), getAllVenues);
router.put("/update-venue/:id", updateVenue);
router.delete("/delete-venue/:id", deleteVenue);


module.exports = router;