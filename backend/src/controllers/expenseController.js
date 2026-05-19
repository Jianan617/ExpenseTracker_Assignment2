const expenseModel = require("../models/expenseModel");
const categoryModel = require("../models/categoryModel");
const activityModel = require("../models/activityModel");
const { validateExpensePayload } = require("../utils/validators");

//check if the category is one of all categories
async function isKnownCategory(categoryName) {
    const categories = await categoryModel.getAllCategories();
    return categories.some((category) => category.name === categoryName);
}

//get all expense records
async function getAllExpenses(req, res) {
    try {
        //getting records
        const expenses = await expenseModel.getAllExpenses(req.user);
        return res.status(200).json({ success: true, data: expenses });
    } catch (error) {
        console.error("Get expenses error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch expenses." });
    }
}

//create a new expense record
async function createExpense(req, res) {
    try {
        //check the input expense record is valid
        const validation = validateExpensePayload(req.body);
        if (!validation.valid) return res.status(400).json({ success: false, message: validation.message });

        //check the category is valid
        if (!(await isKnownCategory(validation.value.category))) {
            return res.status(400).json({ success: false, message: "Invalid category." });
        }

        //creation
        const created = await expenseModel.createExpense(req.user.id, validation.value);
        //record a creation activity
        await activityModel.createActivity(req.user.id, "CREATE_EXPENSE", `Created expense: ${created.title}`);

        return res.status(201).json({ success: true, data: created, message: "Expense created successfully." });
    } catch (error) {
        console.error("Create expense error:", error);
        return res.status(500).json({ success: false, message: "Failed to create expense." });
    }
}

//update an expense record
async function updateExpense(req, res) {
    try {
        //verify the inputted id
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ success: false, message: "Invalid expense id." });
        }

        //verify the inputted data body
        const validation = validateExpensePayload(req.body);
        if (!validation.valid) return res.status(400).json({ success: false, message: validation.message });

        if (!(await isKnownCategory(validation.value.category))) {
            return res.status(400).json({ success: false, message: "Invalid category selected." });
        }

        //updating
        const updated = await expenseModel.updateExpense(id, req.user, validation.value);
        if (updated === "FORBIDDEN") {
            return res.status(403).json({ success: false, message: "You can only update your own expenses." });
        }
        if (!updated) return res.status(404).json({ success: false, message: "Expense not found." });

        //record an updating activity
        await activityModel.createActivity(req.user.id, "UPDATE_EXPENSE", `Updated expense: ${updated.title}`);
        return res.status(200).json({ success: true, data: updated, message: "Expense updated successfully." });
    } catch (error) {
        console.error("Update expense error:", error);
        return res.status(500).json({ success: false, message: "Failed to update expense." });
    }
}

//delete an existed expense
async function deleteExpense(req, res) {
    try {
        //verify the inputted id
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ success: false, message: "Invalid expense id." });
        }

        const existing = await expenseModel.getExpenseById(id);
        //deleting
        const deleted = await expenseModel.deleteExpense(id, req.user);
        if (deleted === "FORBIDDEN") {
            return res.status(403).json({ success: false, message: "You can only delete your own expenses." });
        }
        if (!deleted) return res.status(404).json({ success: false, message: "Expense not found." });
        //record a deleting activity
        await activityModel.createActivity(req.user.id, "DELETE_EXPENSE", `Deleted expense: ${existing ? existing.title : id}`);
        return res.status(200).json({ success: true, message: "Expense deleted successfully." });
    } catch (error) {
        console.error("Delete expense error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete expense." });
    }
}

module.exports = { getAllExpenses, createExpense, updateExpense, deleteExpense };
