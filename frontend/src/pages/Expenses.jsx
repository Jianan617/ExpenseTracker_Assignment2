import { useEffect, useMemo, useRef, useState } from "react";
import ExpenseFormModal from "../components/ExpenseFormModal.jsx";
import DeleteConfirmModal from "../components/DeleteConfirmModal.jsx";
import { createExpense, deleteExpense, getAllExpenses, updateExpense } from "../services/expenseService.js";
import { getCategories } from "../services/categoryService.js";

//format amount as AUD currency
function formatCurrency(value) {
    return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(Number(value || 0));
}

//format date for table display
function formatDate(dateStr) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-AU", { year: "numeric", month: "short", day: "numeric" });
}

//format date into month label for trend section
function formatMonthLabel(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-AU", { year: "numeric", month: "short" });
}

export default function ExpensesPage({ user, onNavigate, onLogout }) {
    //store expense and category data from backend
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);

    //store application state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [feedback, setFeedback] = useState("");

    //modal states for create, edit and delete actions
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingExpense, setDeletingExpense] = useState(null);

    //loading states for form submit and delete confirm
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);

    //search, filter and sort states
    const [searchInput, setSearchInput] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [amountSort, setAmountSort] = useState("default");
    const [showAmountDropdown, setShowAmountDropdown] = useState(false);
    const [dateSort, setDateSort] = useState("default");
    const [showDateDropdown, setShowDateDropdown] = useState(false);

    //refs are used to detect clicks outside dropdowns
    const categoryDropdownRef = useRef(null);
    const amountDropdownRef = useRef(null);
    const dateDropdownRef = useRef(null);

    //build category options from backend category list
    const categoryOptions = useMemo(() => ["All Categories", ...categories.map((category) => category.name)], [categories]);
    const amountSortOptions = [
        { label: "Default", value: "default" },
        { label: "High to Low", value: "desc" },
        { label: "Low to High", value: "asc" },
    ];
    const dateSortOptions = [
        { label: "Default", value: "default" },
        { label: "Oldest to Newest", value: "asc" },
        { label: "Newest to Oldest", value: "desc" },
    ];

    useEffect(() => {
        //close filter dropdowns when user clicks outside them
        const handleClickOutside = (event) => {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) setShowCategoryDropdown(false);
            if (amountDropdownRef.current && !amountDropdownRef.current.contains(event.target)) setShowAmountDropdown(false);
            if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target)) setShowDateDropdown(false);
        };
        document.addEventListener("mousedown", handleClickOutside);

        //clean up event listener when component unmounts
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    //load expenses and categories from backend
    const fetchPageData = async () => {
        try {
            setLoading(true);
            setError("");

            //fetch expenses and categories in parallel
            const [expenseData, categoryData] = await Promise.all([getAllExpenses(), getCategories()]);
            setExpenses(expenseData);
            setCategories(categoryData);
        } catch (e) {
            setError(e.message || "Unable to load expense records.");
        } finally {
            setLoading(false);
        }
    };

    //load page data when component first renders
    useEffect(() => {
        fetchPageData();
    }, []);

    //apply live search, category filter and sorting
    const filteredExpenses = useMemo(() => {
        const keyword = searchInput.trim().toLowerCase();
        let filtered = expenses.filter((expense) => {

            //match keyword against title, description or owner username
            const matchesKeyword = !keyword
                || String(expense.title || "").toLowerCase().includes(keyword)
                || String(expense.description || "").toLowerCase().includes(keyword)
                || String(expense.username || "").toLowerCase().includes(keyword);

            //match selected category
            const matchesCategory = selectedCategory === "All Categories" || expense.category === selectedCategory;
            return matchesKeyword && matchesCategory;
        });

        //sort by amount if selected
        if (amountSort === "desc") filtered = [...filtered].sort((a, b) => Number(b.amount) - Number(a.amount));
        if (amountSort === "asc") filtered = [...filtered].sort((a, b) => Number(a.amount) - Number(b.amount));

        //sort by date if selected
        if (dateSort === "desc") filtered = [...filtered].sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));
        if (dateSort === "asc") filtered = [...filtered].sort((a, b) => new Date(a.expense_date) - new Date(b.expense_date));
        return filtered;
    }, [expenses, searchInput, selectedCategory, amountSort, dateSort]);

    //calculate total amount from currently visible expenses
    const totalAmount = useMemo(() =>
        filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0), [filteredExpenses]
    );

    //group filtered expenses by month for trend display
    const monthlyTrendData = useMemo(() => {
        const monthlyMap = {};
        filteredExpenses.forEach((expense) => {
            const date = new Date(expense.expense_date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            if (!monthlyMap[key]) monthlyMap[key] = { key, label: formatMonthLabel(expense.expense_date), total: 0 };
            monthlyMap[key].total += Number(expense.amount);
        });
        return Object.values(monthlyMap).sort((a, b) => b.key.localeCompare(a.key));
    }, [filteredExpenses]);

    //find max monthly total for trend bar width calculation
    const maxMonthlyAmount = useMemo(() => {
        if (monthlyTrendData.length === 0) return 0;
        return Math.max(...monthlyTrendData.map((item) => item.total));
    }, [monthlyTrendData]);

    //show temporary success feedback
    const showFeedback = (message) => {
        setFeedback(message);
        setTimeout(() => setFeedback(""), 3500);
    };

    //create a new expense through backend API
    const handleCreateExpense = async (formData) => {
        try {
            setSubmitting(true);
            await createExpense(formData);

            //refresh table after creation
            await fetchPageData();
            setShowCreateModal(false);
            showFeedback(`Expense "${formData.title}" was added successfully.`);
        } finally {
            setSubmitting(false);
        }
    };

    //update selected expense through backend API
    const handleUpdateExpense = async (formData) => {
        try {
            setSubmitting(true);
            await updateExpense(editingExpense.id, formData);

            //refresh table after update
            await fetchPageData();
            setShowEditModal(false);
            setEditingExpense(null);
            showFeedback(`Expense "${formData.title}" was updated successfully.`);
        } finally {
            setSubmitting(false);
        }
    };

    //delete selected expense through backend API
    const handleDeleteExpense = async () => {
        try {
            if (!deletingExpense) return;
            setDeleting(true);
            await deleteExpense(deletingExpense.id);

            //refresh table after deletion
            await fetchPageData();
            setShowDeleteModal(false);
            showFeedback(`Expense "${deletingExpense.title}" was deleted successfully.`);
            setDeletingExpense(null);
        } catch (e) {
            setError(e.message || "Failed to delete expense.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="page-shell">
            <header className="header-section">
                <div>
                    <p className="page-name">Expense Tracker</p>
                    <p className="header-subtitle">Logged in as {user.username} ({user.role})</p>
                </div>
                <div className="header-actions">
                    {user.role === "Admin" && <button className="light-btn" onClick={() => onNavigate("admin")}>Admin Panel</button>}
                    <button className="light-btn" onClick={onLogout}>Logout</button>
                </div>
            </header>

            {feedback && <div className="banner success-banner">{feedback}</div>}
            {error && <div className="banner error-alert">{error}</div>}

            <section className="stats-grid stats-grid-three">
                <div className="stat-card">
                    <span className="stat-label">Total Records</span>
                    <strong className="stat-value">{filteredExpenses.length}</strong>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Total Amount</span>
                    <strong className="stat-value">{formatCurrency(totalAmount)}</strong>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Visible Scope</span>
                    <strong className="stat-value stat-small">{user.role === "Admin" ? "All Users" : "My Expenses"}</strong>
                </div>
            </section>

            <section className="trend-card">
                <div className="trend-header">
                    <h2>Monthly Expenditure Trend</h2>
                    <p>Calculated from the currently filtered expense list.</p>
                </div>
                {monthlyTrendData.length > 0 ? (
                    <div className="trend-list">
                        {monthlyTrendData.map((item) => (
                            <div key={item.key} className="trend-item">
                                <div className="trend-item-left">
                                    <span className="trend-month">{item.label}</span>
                                    <div className="trend-bar-track">
                                        <div className="trend-bar-fill" style={{ width: maxMonthlyAmount ? `${(item.total / maxMonthlyAmount) * 100}%` : "0%" }} />
                                    </div>
                                </div>
                                <div className="trend-item-right"><strong className="trend-amount">{formatCurrency(item.total)}</strong></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="trend-empty"><p>No monthly expenditure data available.</p></div>
                )}
            </section>

            <section className="content-card">
                <div className="section-header section-header-row">
                    <div>
                        <h2>All Expenses</h2>
                        <p>{user.role === "Admin" ? "Admin can view all users' expense records." : "You can create, update and delete your own expense records."}</p>
                    </div>
                    <div className="title-actions">
                        <input className="search-input" placeholder="Search title, note or user" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
                        <button className="add-btn" onClick={() => setShowCreateModal(true)}>+ New</button>
                    </div>
                </div>

                {loading ? (
                    <div className="state-box">Loading expense records...</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="expense-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th className="table-header-cell">
                                        <div className="table-header-filter-wrapper" ref={categoryDropdownRef}>
                                            <button type="button" className="table-header-filter-btn" onClick={() => setShowCategoryDropdown((prev) => !prev)}>
                                                {selectedCategory === "All Categories" ? "Category" : `Category: ${selectedCategory}`}
                                                <span className="table-header-filter-arrow">{showCategoryDropdown ? "▲" : "▼"}</span>
                                            </button>
                                            {showCategoryDropdown && (
                                                <div className="table-header-dropdown">
                                                    {categoryOptions.map((category) => (
                                                        <button key={category} type="button" className="table-header-dropdown-item" onClick={() => { setSelectedCategory(category); setShowCategoryDropdown(false); }}>
                                                            {category}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                    <th className="table-header-cell">
                                        <div className="table-header-filter-wrapper" ref={amountDropdownRef}>
                                            <button type="button" className="table-header-filter-btn" onClick={() => setShowAmountDropdown((prev) => !prev)}>
                                                {amountSort === "default" ? "Amount" : amountSort === "desc" ? "Amount: High to Low" : "Amount: Low to High"}
                                                <span className="table-header-filter-arrow">{showAmountDropdown ? "▲" : "▼"}</span>
                                            </button>
                                            {showAmountDropdown && (
                                                <div className="table-header-dropdown">
                                                    {amountSortOptions.map((option) => (
                                                        <button key={option.value} type="button" className="table-header-dropdown-item" onClick={() => { setAmountSort(option.value); setShowAmountDropdown(false); }}>{option.label}</button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                    <th className="table-header-cell">
                                        <div className="table-header-filter-wrapper" ref={dateDropdownRef}>
                                            <button type="button" className="table-header-filter-btn" onClick={() => setShowDateDropdown((prev) => !prev)}>
                                                {dateSort === "default" ? "Date" : dateSort === "asc" ? "Date: Oldest to Newest" : "Date: Newest to Oldest"}
                                                <span className="table-header-filter-arrow">{showDateDropdown ? "▲" : "▼"}</span>
                                            </button>
                                            {showDateDropdown && (
                                                <div className="table-header-dropdown">
                                                    {dateSortOptions.map((option) => (
                                                        <button key={option.value} type="button" className="table-header-dropdown-item" onClick={() => { setDateSort(option.value); setShowDateDropdown(false); }}>{option.label}</button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                    {user.role === "Admin" && <th>Owner</th>}
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.length === 0 ? (
                                    <tr className="empty-result-row"><td colSpan={user.role === "Admin" ? 7 : 6}>No expenses match the current filters.</td></tr>
                                ) : filteredExpenses.map((expense) => (
                                    <tr key={expense.id}>
                                        <td><strong>{expense.title}</strong></td>
                                        <td>{expense.category}</td>
                                        <td>{formatCurrency(expense.amount)}</td>
                                        <td>{formatDate(expense.expense_date)}</td>
                                        {user.role === "Admin" && <td>{expense.username}</td>}
                                        <td>{expense.description || "-"}</td>
                                        <td className="action-cell">
                                            <button className="edit-btn" onClick={() => { setEditingExpense(expense); setShowEditModal(true); }}>Edit</button>
                                            <button className="delete-btn" onClick={() => { setDeletingExpense(expense); setShowDeleteModal(true); }}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <ExpenseFormModal open={showCreateModal} mode="create" categories={categories} onClose={() => setShowCreateModal(false)} onSubmit={handleCreateExpense} submitting={submitting} />
            <ExpenseFormModal open={showEditModal} mode="edit" expense={editingExpense} categories={categories} onClose={() => { setShowEditModal(false); setEditingExpense(null); }} onSubmit={handleUpdateExpense} submitting={submitting} />
            <DeleteConfirmModal open={showDeleteModal} expense={deletingExpense} deleting={deleting} onClose={() => { setShowDeleteModal(false); setDeletingExpense(null); }} onConfirm={handleDeleteExpense} />
        </div>
    );
}
