const pool = require("../config/db");

async function getAllCategories() {
    const [rows] = await pool.query(
        `SELECT id, name, created_at, updated_at
         FROM categories
         ORDER BY name ASC`
    );
    return rows;
}

async function createCategory(name) {
    const [result] = await pool.query(
        `INSERT INTO categories (name) VALUES (?)`,
        [name]
    );
    const [rows] = await pool.query(`SELECT id, name, created_at, updated_at FROM categories WHERE id = ?`, [result.insertId]);
    return rows[0];
}

async function updateCategory(id, name) {
    const [existingRows] = await pool.query(`SELECT name FROM categories WHERE id = ?`, [id]);
    if (!existingRows[0]) return null;

    const oldName = existingRows[0].name;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query(`UPDATE categories SET name = ? WHERE id = ?`, [name, id]);
        await connection.query(`UPDATE expenses SET category = ? WHERE category = ?`, [name, oldName]);
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }

    const [rows] = await pool.query(`SELECT id, name, created_at, updated_at FROM categories WHERE id = ?`, [id]);
    return rows[0];
}

async function deleteCategory(id) {
    const [rows] = await pool.query(`SELECT name FROM categories WHERE id = ?`, [id]);
    if (!rows[0]) return false;

    const [usedRows] = await pool.query(`SELECT COUNT(*) AS count FROM expenses WHERE category = ?`, [rows[0].name]);
    if (usedRows[0].count > 0) {
        const error = new Error("This category is used by existing expenses and cannot be deleted.");
        error.code = "CATEGORY_IN_USE";
        throw error;
    }

    const [result] = await pool.query(`DELETE FROM categories WHERE id = ?`, [id]);
    return result.affectedRows > 0;
}

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };
