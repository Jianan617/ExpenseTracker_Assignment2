import { useEffect, useState } from "react";
import { deleteUser, getActivities, getUsers, updateUser } from "../services/adminService.js";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../services/categoryService.js";

//format database datetime into local date and/or time.
function formatDateTime(value) {
    if (!value) return "-";
    return new Date(value).toLocaleString("en-AU", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function AdminPanel({ user, onNavigate, onLogout }) {
    //store admin data loaded from backend
    const [users, setUsers] = useState([]);
    const [activities, setActivities] = useState([]);
    const [categories, setCategories] = useState([]);

    //store input value for creating a new category
    const [newCategoryName, setNewCategoryName] = useState("");

    //store application state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [feedback, setFeedback] = useState("");

    //load users, activity logs and categories together
    const loadAdminData = async () => {
        try {
            setLoading(true);
            setError("");
            const [userData, activityData, categoryData]
                = await Promise.all([getUsers(), getActivities(), getCategories()]);
            setUsers(userData);
            setActivities(activityData);
            setCategories(categoryData);
        } catch (e) {
            setError(e.message || "Unable to load admin data.");
        } finally {
            setLoading(false);
        }
    };

    //load admin data when the page first renders
    useEffect(() => {
        loadAdminData();
    }, []);

    //show temporary success message
    const showFeedback = (message) => {
        setFeedback(message);
        setTimeout(() => setFeedback(""), 3500);
    };

    //update user field locally before saving to backend
    const updateLocalUserField = (id, field, value) => {
        setUsers((prev) => prev.map((item) => item.id === id ? { ...item, [field]: value } : item));
    };

    //update category name locally before saving to backend
    const updateLocalCategoryName = (id, name) => {
        setCategories((prev) => prev.map((category) => category.id === id ? { ...category, name } : category));
    };

    //save edited user information to backend
    const handleSaveUser = async (item) => {
        try {
            await updateUser(item.id, { username: item.username, email: item.email, role: item.role });
            //reload latest data after update
            await loadAdminData();
            showFeedback(`User "${item.username}" was updated.`);
        } catch (e) {
            setError(e.message || "Failed to update user.");
        }
    };

    //delete selected user after confirmation
    const handleDeleteUser = async (item) => {
        if (!window.confirm(`Delete user "${item.username}"?`)) return;
        try {
            await deleteUser(item.id);
            //reload list after deletion
            await loadAdminData();
            showFeedback(`User "${item.username}" was deleted.`);
        } catch (e) {
            setError(e.message || "Failed to delete user.");
        }
    };

    //create a new category
    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            await createCategory(newCategoryName.trim());
            setNewCategoryName("");
            //reload categories after creation
            await loadAdminData();
            showFeedback("Category was created.");
        } catch (e) {
            setError(e.message || "Failed to create category.");
        }
    };

    //save edited category name
    const handleSaveCategory = async (category) => {
        try {
            await updateCategory(category.id, category.name);
            //reload latest category data
            await loadAdminData();
            showFeedback(`Category "${category.name}" was updated.`);
        } catch (e) {
            setError(e.message || "Failed to update category.");
        }
    };

    //delete selected category
    const handleDeleteCategory = async (category) => {
        if (!window.confirm(`Delete category "${category.name}"?`)) return;
        try {
            await deleteCategory(category.id);
            //reload categories after deletion
            await loadAdminData();
            showFeedback(`Category "${category.name}" was deleted.`);
        } catch (e) {
            setError(e.message || "Failed to delete category.");
        }
    };

    return (
        <div className="page-shell">
            <header className="header-section">
                <div>
                    <p className="page-name">Admin Panel</p>
                    <p className="header-subtitle">Logged in as {user.username} ({user.role})</p>
                </div>
                <div className="header-actions">
                    <button className="light-btn" onClick={() => onNavigate("expenses")}>Expense Dashboard</button>
                    <button className="light-btn" onClick={onLogout}>Logout</button>
                </div>
            </header>

            {feedback && <div className="banner success-banner">{feedback}</div>}
            {error && <div className="banner error-alert">{error}</div>}

            {loading ? (
                <div className="state-box">Loading admin data...</div>
            ) : (
                <>
                    <section className="content-card admin-section">
                        <div className="section-header">
                            <h2>User Management</h2>
                            <p>Admin can manage user accounts and roles. The last admin account cannot be removed.</p>
                        </div>
                        <div className="table-wrapper">
                            <table className="expense-table admin-table">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((item) => (
                                        <tr key={item.id}>
                                            <td><input value={item.username} onChange={(e) => updateLocalUserField(item.id, "username", e.target.value)} /></td>
                                            <td><input value={item.email} onChange={(e) => updateLocalUserField(item.id, "email", e.target.value)} /></td>
                                            <td>
                                                <select value={item.role} onChange={(e) => updateLocalUserField(item.id, "role", e.target.value)}>
                                                    <option value="Admin">Admin</option>
                                                    <option value="User">User</option>
                                                </select>
                                            </td>
                                            <td>{formatDateTime(item.created_at)}</td>
                                            <td className="action-cell">
                                                <button className="edit-btn" onClick={() => handleSaveUser(item)}>Save</button>
                                                <button className="delete-btn" onClick={() => handleDeleteUser(item)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="content-card admin-section">
                        <div className="section-header section-header-row">
                            <div>
                                <h2>Category Management</h2>
                                <p>Categories are used by the expense form and table filter.</p>
                            </div>
                            <div className="title-actions">
                                <input className="search-input" placeholder="New category" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                                <button className="add-btn" onClick={handleCreateCategory}>Add</button>
                            </div>
                        </div>
                        <div className="category-grid">
                            {categories.map((category) => (
                                <div className="category-card" key={category.id}>
                                    <input value={category.name} onChange={(e) => updateLocalCategoryName(category.id, e.target.value)} />
                                    <div className="category-actions">
                                        <button className="edit-btn" onClick={() => handleSaveCategory(category)}>Save</button>
                                        <button className="delete-btn" onClick={() => handleDeleteCategory(category)}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="content-card admin-section">
                        <div className="section-header">
                            <h2>User Activity Logs</h2>
                            <p>Records login, logout and CRUD actions for accountability.</p>
                        </div>
                        <div className="table-wrapper">
                            <table className="expense-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Action</th>
                                        <th>Details</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activities.length === 0 ? (
                                        <tr className="empty-result-row"><td colSpan="4">No activity logs yet.</td></tr>
                                    ) : activities.map((activity) => (
                                        <tr key={activity.id}>
                                            <td>{activity.username}</td>
                                            <td><span className="activity-badge">{activity.action}</span></td>
                                            <td>{activity.details || "-"}</td>
                                            <td>{formatDateTime(activity.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
