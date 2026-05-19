const express = require("express");
const adminController = require("../controllers/adminController");
const { authenticateToken, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken, requireAdmin); //it means all admin routes must go through authenticateToken
router.get("/users", adminController.getUsers); //get all users
router.put("/users/:id", adminController.updateUser); //update user by id
router.delete("/users/:id", adminController.deleteUser); //delete user by id
router.get("/activities", adminController.getActivities); // get all activity logs

module.exports = router;
