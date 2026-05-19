const express = require("express");
const categoryController = require("../controllers/categoryController");
const { authenticateToken, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, categoryController.getCategories); //get all available categories
router.post("/", authenticateToken, requireAdmin, categoryController.createCategory); //create a new category for admin only
router.put("/:id", authenticateToken, requireAdmin, categoryController.updateCategory); //update an existing category by id for admin only
router.delete("/:id", authenticateToken, requireAdmin, categoryController.deleteCategory); //delete an existing category by id for admin only

module.exports = router;
