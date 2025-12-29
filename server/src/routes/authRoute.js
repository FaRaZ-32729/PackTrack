const express = require("express");
const { registerUser, logInUser, logOutUser, adminRegistration, verifyMe } = require("../controllers/authController");
const authUser = require("../middlewares/authMiddleware");
const router = express.Router();



router.post("/register-admin", adminRegistration);
router.post("/register", authUser, registerUser);
router.post("/me", authUser, verifyMe);
router.post("/login", logInUser);
router.delete("/logout", authUser, logOutUser);


module.exports = router;