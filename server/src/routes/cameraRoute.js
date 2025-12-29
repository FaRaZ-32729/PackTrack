const express = require("express");
const { registerCamera, listCameraByVenue, streamCamera, updateCamera, deleteCamera } = require("../controllers/cameraController");
const roleAccess = require("../middlewares/roleMiddleware");
const router = express.Router();

router.post("/new-camera", roleAccess("admin", "manager", "sub-manager"), registerCamera);
router.get("/:id", listCameraByVenue);
router.get("/stream/:id", streamCamera);
router.put("/update-camera/:id", updateCamera);
router.delete("/delete-camera/:id", deleteCamera);


module.exports = router;