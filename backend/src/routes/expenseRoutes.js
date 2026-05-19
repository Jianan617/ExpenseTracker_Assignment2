const express = require("express");
const expenseController = require("../controllers/expenseController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, expenseController.getAllExpenses);
router.post("/", authenticateToken, expenseController.createExpense);
router.put("/:id", authenticateToken, expenseController.updateExpense);
router.delete("/:id", authenticateToken, expenseController.deleteExpense);

module.exports = router;
