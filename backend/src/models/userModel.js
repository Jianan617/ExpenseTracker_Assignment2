const pool = require("../config/db");

//find user by username or email
async function findByUsernameOrEmail(identifier) {
    const [rows] = await pool.query(
        `SELECT id, username, email, password_hash, role, created_at, updated_at
         FROM users
         WHERE username = ? OR email = ?
         LIMIT 1`,
        [identifier, identifier]
    );
    return rows[0] || null;
}

//find user by id
async function findById(id) {
    const [rows] = await pool.query(
        `SELECT id, username, email, role, created_at, updated_at
         FROM users
         WHERE id = ?`,
        [id]
    );
    return rows[0] || null;
}

//create a new user and return it
async function createUser({ username, email, password_hash, role = "User" }) {
    const [result] = await pool.query(
        `INSERT INTO users (username, email, password_hash, role)
         VALUES (?, ?, ?, ?)`,
        [username, email, password_hash, role]
    );
    return findById(result.insertId);
}

//return all users
async function getAllUsers() {
    const [rows] = await pool.query(
        `SELECT id, username, email, role, created_at, updated_at
         FROM users
         ORDER BY created_at DESC`
    );
    return rows;
}

//update one user
async function updateUser(id, { username, email, role }) {
    const [result] = await pool.query(
        `UPDATE users
         SET username = ?, email = ?, role = ?
         WHERE id = ?`,
        [username, email, role, id]
    );
    if (result.affectedRows === 0) return null;
    return findById(id);
}

//delete a user
async function deleteUser(id) {
    const [result] = await pool.query(`DELETE FROM users WHERE id = ?`, [id]);
    return result.affectedRows > 0;
}

//count total number of admin
async function countAdmins() {
    const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM users WHERE role = 'Admin'`);
    return rows[0].count;
}

module.exports = {
    findByUsernameOrEmail,
    findById,
    createUser,
    getAllUsers,
    updateUser,
    deleteUser,
    countAdmins,
};
