import { useEffect, useMemo, useState } from "react";

//default form values for creating a new expense
const initialForm = {
    title: "",
    category: "",
    amount: "",
    expense_date: "",
    description: "",
};

//convert database date value to yyyy-mm-dd for date input
function formatDateForInput(value) {
    if (!value) return "";
    return String(value).slice(0, 10);
}

export default function ExpenseFormModal({ open, mode = "create", expense, categories = [], onClose, onSubmit, submitting }) {
    //store current form input values
    const [formData, setFormData] = useState(initialForm);
    //store backend submit error message
    const [submitError, setSubmitError] = useState("");

    useEffect(() => {
        if (!open) return;
        if (mode === "edit" && expense) {
            //fill form with selected expense data in edit mode
            //eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                title: expense.title || "",
                category: expense.category || "",
                amount: expense.amount || "",
                expense_date: formatDateForInput(expense.expense_date),
                description: expense.description || "",
            });
        } else {
            //reset form and select the first available category in create mode
            setFormData({ ...initialForm, category: categories[0]?.name || "" });
        }
        //clear previous submit error when modal opens
        setSubmitError("");
    }, [open, mode, expense, categories]);

    const errors = useMemo(() => {
        const nextErrors = {};
        //validate required title
        if (!formData.title.trim()) nextErrors.title = "Title is required.";
        //validate required category
        if (!formData.category.trim()) nextErrors.category = "Category is required.";

        if (formData.amount === "") {
            nextErrors.amount = "Amount is required.";
        } else if (Number.isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
            //validate amount as a positive number
            nextErrors.amount = "Amount must be a positive number.";
        }
        //validate required date
        if (!formData.expense_date) nextErrors.expense_date = "Date is required.";
        return nextErrors;
    }, [formData]);

    //form can only be submitted when there are no validation errors
    const isValid = Object.keys(errors).length === 0;

    const handleChange = (event) => {
        const { name, value } = event.target;

        //update the changed field by input name
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        //prevent browser page refresh
        event.preventDefault();
        //stop submission if frontend validation fails
        if (!isValid) return;
        try {
            setSubmitError("");

            //send cleaned form data to parent submit handler
            await onSubmit({
                title: formData.title.trim(),
                category: formData.category,
                amount: Number(formData.amount),
                expense_date: formData.expense_date,
                description: formData.description.trim(),
            });
        } catch (error) {
            //show backend or API error message
            setSubmitError(error.message || "Unable to save this expense.");
        }
    };

    //do not render modal when it is closed
    if (!open) return null;

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-card">
                <div className="modal-header">
                    <p className="modal-name">{mode === "edit" ? "Edit Expense" : "Add Expense"}</p>
                </div>

                <form className="expense-form" onSubmit={handleSubmit}>
                    <div className="form-column">
                        <div className="form-field">
                            <label htmlFor="title">Title</label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                placeholder="e.g. Lunch"
                                value={formData.title}
                                onChange={handleChange}
                            />
                            {errors.title && <span className="field-error">{errors.title}</span>}
                        </div>

                        <div className="form-field">
                            <label htmlFor="category">Category</label>
                            <select id="category" name="category" value={formData.category} onChange={handleChange}>
                                {categories.length === 0 && <option value="">No categories available</option>}
                                {categories.map((category) => (
                                    <option key={category.id || category.name} value={category.name}>{category.name}</option>
                                ))}
                            </select>
                            {errors.category && <span className="field-error">{errors.category}</span>}
                        </div>

                        <div className="form-field">
                            <label htmlFor="amount">Amount (AUD)</label>
                            <input
                                id="amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={handleChange}
                            />
                            {errors.amount && <span className="field-error">{errors.amount}</span>}
                        </div>

                        <div className="form-field">
                            <label htmlFor="expense_date">Date</label>
                            <input
                                id="expense_date"
                                name="expense_date"
                                type="date"
                                value={formData.expense_date}
                                onChange={handleChange}
                            />
                            {errors.expense_date && <span className="field-error">{errors.expense_date}</span>}
                        </div>

                        <div className="form-field">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                rows="4"
                                placeholder="Optional notes about this expense."
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {submitError && <div className="form-alert error-alert">{submitError}</div>}

                    <div className="modal-actions">
                        <button className="cancel-btn" type="button" onClick={onClose} disabled={submitting}>Cancel</button>
                        <button className="submit-btn" type="submit" disabled={!isValid || submitting}>
                            {submitting ? (mode === "edit" ? "Updating..." : "Saving...") : (mode === "edit" ? "Update" : "Submit")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
