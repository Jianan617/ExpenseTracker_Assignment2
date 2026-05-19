const expenseModel = require("../models/expenseModel");
const categoryModel = require("../models/categoryModel");
const activityModel = require("../models/activityModel");
const { validateExpensePayload } = require("../utils/validators");

async function isKnownCategory(categoryName) {
    const categories = await categoryModel.getAllCategories();
    return categories.some((category) => category.name === categoryName);
}

async function getAllExpenses(req, res) {
    try {
        const expenses = await expenseModel.getAllExpenses(req.user);
        return res.status(200).json({ success: true, data: expenses });
    } catch (error) {
        console.error("Get expenses error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch expenses." });
    }
}

async function createExpense(req, res) {
    try {
        const validation = validateExpensePayload(req.body);
        if (!validation.valid) return res.status(400).json({ success: false, message: validation.message });

        if (!(await isKnownCategory(validation.value.category))) {
            return res.status(400).json({ success: false, message: "Invalid category selected." });
        }

        const created = await expenseModel.createExpense(req.user.id, validation.value);
        await activityModel.createActivity(req.user.id, "CREATE_EXPENSE", `Created expense: ${created.title}`);

        return res.status(201).json({ success: true, data: created, message: "Expense created successfully." });
    } catch (error) {
        console.error("Create expense error:", error);
        return res.status(500).json({ success: false, message: "Failed to create expense." });
    }
}

async function updateExpense(req, res) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ success: false, message: "Invalid expense id." });
        }

        const validation = validateExpensePayload(req.body);
        if (!validation.valid) return res.status(400).json({ success: false, message: validation.message });

        if (!(await isKnownCategory(validation.value.category))) {
            return res.status(400).json({ success: false, message: "Invalid category selected." });
        }

        const updated = await expenseModel.updateExpense(id, req.user, validation.value);
        if (updated === "FORBIDDEN") {
            return res.status(403).json({ success: false, message: "You can only update your own expenses." });
        }
        if (!updated) return res.status(404).json({ success: false, message: "Expense not found." });

        await activityModel.createActivity(req.user.id, "UPDATE_EXPENSE", `Updated expense: ${updated.title}`);
        return res.status(200).json({ success: true, data: updated, message: "Expense updated successfully." });
    } catch (error) {
        console.error("Update expense error:", error);
        return res.status(500).json({ success: false, message: "Failed to update expense." });
    }
}

async function deleteExpense(req, res) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ success: false, message: "Invalid expense id." });
        }

        const existing = await expenseModel.getExpenseById(id);
        const deleted = await expenseModel.deleteExpense(id, req.user);
        if (deleted === "FORBIDDEN") {
            return res.status(403).json({ success: false, message: "You can only delete your own expenses." });
        }
        if (!deleted) return res.status(404).json({ success: false, message: "Expense not found." });

        await activityModel.createActivity(req.user.id, "DELETE_EXPENSE", `Deleted expense: ${existing ? existing.title : id}`);
        return res.status(200).json({ success: true, message: "Expense deleted successfully." });
    } catch (error) {
        console.error("Delete expense error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete expense." });
    }
}

module.exports = { getAllExpenses, createExpense, updateExpense, deleteExpense };
