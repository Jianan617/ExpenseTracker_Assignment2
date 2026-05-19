const express = require("express");
const expenseController = require("../controllers/expenseController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, expenseController.getAllExpenses); // get all expense records
router.post("/", authenticateToken, expenseController.createExpense); // create a new expense record
router.put("/:id", authenticateToken, expenseController.updateExpense); // update an existing expense record by id
router.delete("/:id", authenticateToken, expenseController.deleteExpense); // delete an existing expense record by id

module.exports = router;
