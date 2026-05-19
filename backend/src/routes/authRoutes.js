const express = require("express");
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", authController.register); //it's a public route for user registration
router.post("/login", authController.login); //it's a public route for user login
router.get("/me", authenticateToken, authController.getMe); //it's a protected route to get the currently logged user's information
router.post("/logout", authenticateToken, authController.logout); //it's a protected route for user logout

module.exports = router;
