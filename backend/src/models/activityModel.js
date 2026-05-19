const pool = require("../config/db");

async function createActivity(userId, action, details = "") {
    if (!userId) return null;
    const [result] = await pool.query(
        `INSERT INTO user_activities (user_id, action, details)
         VALUES (?, ?, ?)`,
        [userId, action, details || null]
    );
    return result.insertId;
}

async function getAllActivities() {
    const [rows] = await pool.query(
        `SELECT a.id, a.user_id, u.username, u.email, a.action, a.details, a.created_at
         FROM user_activities a
         JOIN users u ON a.user_id = u.id
         ORDER BY a.created_at DESC
         LIMIT 200`
    );
    return rows;
}

module.exports = { createActivity, getAllActivities };
