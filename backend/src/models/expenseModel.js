const pool = require("../config/db");

const EXPENSE_SELECT = `e.id, e.user_id, e.title, e.category, e.amount, e.expense_date, e.description, e.created_at, e.updated_at`;
const EXPENSE_SELECT_SINGLE = `id, user_id, title, category, amount, expense_date, description, created_at, updated_at`;

async function getAllExpenses(user) {
    if (user.role === "Admin") {
        const [rows] = await pool.query(
            `SELECT ${EXPENSE_SELECT}, u.username
             FROM expenses e
             JOIN users u ON e.user_id = u.id
             ORDER BY e.expense_date DESC, e.id DESC`
        );
        return rows;
    }

    const [rows] = await pool.query(
        `SELECT ${EXPENSE_SELECT}, u.username
         FROM expenses e
         JOIN users u ON e.user_id = u.id
         WHERE e.user_id = ?
         ORDER BY e.expense_date DESC, e.id DESC`,
        [user.id]
    );
    return rows;
}

async function getExpenseById(id) {
    const [rows] = await pool.query(
        `SELECT ${EXPENSE_SELECT_SINGLE}
         FROM expenses
         WHERE id = ?`,
        [id]
    );
    return rows[0] || null;
}

async function createExpense(userId, expenseData) {
    const { title, category, amount, expense_date, description } = expenseData;
    const [result] = await pool.query(
        `INSERT INTO expenses (user_id, title, category, amount, expense_date, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, title, category, amount, expense_date, description || null]
    );
    return getExpenseById(result.insertId);
}

async function updateExpense(id, user, expenseData) {
    const existing = await getExpenseById(id);
    if (!existing) return null;
    if (user.role !== "Admin" && existing.user_id !== user.id) return "FORBIDDEN";

    const { title, category, amount, expense_date, description } = expenseData;
    await pool.query(
        `UPDATE expenses
         SET title = ?, category = ?, amount = ?, expense_date = ?, description = ?
         WHERE id = ?`,
        [title, category, amount, expense_date, description || null, id]
    );
    return getExpenseById(id);
}

async function deleteExpense(id, user) {
    const existing = await getExpenseById(id);
    if (!existing) return null;
    if (user.role !== "Admin" && existing.user_id !== user.id) return "FORBIDDEN";

    const [result] = await pool.query(`DELETE FROM expenses WHERE id = ?`, [id]);
    return result.affectedRows > 0;
}

module.exports = { getAllExpenses, getExpenseById, createExpense, updateExpense, deleteExpense };
