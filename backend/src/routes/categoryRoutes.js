const express = require("express");
const categoryController = require("../controllers/categoryController");
const { authenticateToken, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, categoryController.getCategories);
router.post("/", authenticateToken, requireAdmin, categoryController.createCategory);
router.put("/:id", authenticateToken, requireAdmin, categoryController.updateCategory);
router.delete("/:id", authenticateToken, requireAdmin, categoryController.deleteCategory);

module.exports = router;
