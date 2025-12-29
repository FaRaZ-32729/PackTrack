const express = require("express");
const { getBoxCountByVenue, getBoxCountByOrganization } = require("../controllers/sensorController");
const router = express.Router();

router.get("/venue/:venueId", getBoxCountByVenue);
router.get("/organization/:orgId", getBoxCountByOrganization);

module.exports = router;