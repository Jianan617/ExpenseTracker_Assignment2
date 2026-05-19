const userModel = require("../models/userModel");
const activityModel = require("../models/activityModel");
const { isValidEmail } = require("../utils/validators");

//get all users
async function getUsers(req, res) {
    try {
        const users = await userModel.getAllUsers();
        return res.status(200).json({ success: true, data: users });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch users." });
    }
}

//update a user
async function updateUser(req, res) {
    try {
        const id = Number(req.params.id);
        const username = String(req.body.username || "").trim();
        const email = String(req.body.email || "").trim();
        const role = String(req.body.role || "User").trim();

        if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ success: false, message: "Invalid user id." });
        if (!username || !email) return res.status(400).json({ success: false, message: "Username and email are required." });
        if (!isValidEmail(email)) return res.status(400).json({ success: false, message: "A valid email is required." });
        if (!["Admin", "User"].includes(role)) return res.status(400).json({ success: false, message: "Invalid role." });

        const existing = await userModel.findById(id);
        //ensure user exist in the database
        if (!existing) return res.status(404).json({ success: false, message: "User not found." });
        if (existing.role === "Admin" && role !== "Admin" && (await userModel.countAdmins()) <= 1) {
            return res.status(400).json({ success: false, message: "At least one admin account must remain." });
        }

        const updated = await userModel.updateUser(id, { username, email, role });
        //record the update activity
        await activityModel.createActivity(req.user.id, "UPDATE_USER", `Updated user: ${updated.username}`);
        return res.status(200).json({ success: true, data: updated });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ success: false, message: "Username or email already exists." });
        }
        return res.status(500).json({ success: false, message: "Failed to update user." });
    }
}

//delete a user
async function deleteUser(req, res) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ success: false, message: "Invalid user id." });
        if (id === req.user.id) return res.status(400).json({ success: false, message: "You cannot delete your own account while logged in." });
        //check the user is existed
        const existing = await userModel.findById(id);
        if (!existing) return res.status(404).json({ success: false, message: "User not found." });
        //there should be at least one admin
        if (existing.role === "Admin" && (await userModel.countAdmins()) <= 1) {
            return res.status(400).json({ success: false, message: "At least one admin account must remain." });
        }

        await userModel.deleteUser(id);
        //record the delete activity
        await activityModel.createActivity(req.user.id, "DELETE_USER", `Deleted user: ${existing.username}`);
        return res.status(200).json({ success: true, message: "User deleted successfully." });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to delete user." });
    }
}

//get all activity logs
async function getActivities(req, res) {
    try {
        const activities = await activityModel.getAllActivities();
        return res.status(200).json({ success: true, data: activities });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch activity logs." });
    }
}

module.exports = { getUsers, updateUser, deleteUser, getActivities };
