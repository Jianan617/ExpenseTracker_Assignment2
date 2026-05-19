const categoryModel = require("../models/categoryModel");
const activityModel = require("../models/activityModel");

//get all categories
async function getCategories(req, res) {
    try {
        const categories = await categoryModel.getAllCategories();
        return res.status(200).json({ success: true, data: categories });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch categories." });
    }
}

//create a new category
async function createCategory(req, res) {
    try {
        const name = String(req.body.name || "").trim();
        if (!name) return res.status(400).json({ success: false, message: "Category name is required." });
        //creation
        const category = await categoryModel.createCategory(name);
        //record the creation activity
        await activityModel.createActivity(req.user.id, "CREATE_CATEGORY", `Created category: ${name}`);
        return res.status(201).json({ success: true, data: category });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ success: false, message: "Category already exists." });
        }
        return res.status(500).json({ success: false, message: "Failed to create category." });
    }
}

//update a category
async function updateCategory(req, res) {
    try {
        const id = Number(req.params.id);
        const name = String(req.body.name || "").trim();
        if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ success: false, message: "Invalid category id." });
        if (!name) return res.status(400).json({ success: false, message: "Category name is required." });
        //update
        const category = await categoryModel.updateCategory(id, name);
        if (!category) return res.status(404).json({ success: false, message: "Category not found." });
        //record the update activity
        await activityModel.createActivity(req.user.id, "UPDATE_CATEGORY", `Updated category: ${name}`);
        return res.status(200).json({ success: true, data: category });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ success: false, message: "Category already exists." });
        }
        return res.status(500).json({ success: false, message: "Failed to update category." });
    }
}

//delete a category
async function deleteCategory(req, res) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ success: false, message: "Invalid category id." });
        //delete
        const deleted = await categoryModel.deleteCategory(id);
        if (!deleted) return res.status(404).json({ success: false, message: "Category not found." });
        //record the delete activity
        await activityModel.createActivity(req.user.id, "DELETE_CATEGORY", `Deleted category id: ${id}`);
        return res.status(200).json({ success: true, message: "Category deleted successfully." });
    } catch (error) {
        if (error.code === "CATEGORY_IN_USE") {
            return res.status(409).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: "Failed to delete category." });
    }
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
