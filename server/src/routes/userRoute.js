const express = require("express");
const { updateUser, getAdminUsers, getManagerUsers } = require("../controllers/userController");
const roleAccess = require("../middlewares/roleMiddleware");
const router = express.Router();


router.put("/update/:userId", roleAccess("admin", "manager"), updateUser);
router.get("/admin-users", roleAccess("admin"), getAdminUsers);
router.get("/manager-users", roleAccess("manager"), getManagerUsers);

module.exports = router