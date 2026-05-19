//use regular expression to verify email format
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

//verify the data input is valid
function validateExpensePayload(payload) {
    const title = String(payload.title || "").trim();
    const category = String(payload.category || "").trim();
    const amount = Number(payload.amount);
    const expenseDate = payload.expense_date;
    const description = payload.description ? String(payload.description).trim() : "";

    if (!title) return { valid: false, message: "Title is required." };
    if (!category) return { valid: false, message: "Category is required." };
    if (Number.isNaN(amount) || amount <= 0) return { valid: false, message: "Amount must be a positive number." };
    if (!expenseDate || Number.isNaN(new Date(expenseDate).getTime())) {
        return { valid: false, message: "A valid expense date is required." };
    }

    return {
        valid: true,
        value: {
            title,
            category,
            amount,
            expense_date: expenseDate,
            description,
        },
    };
}

module.exports = { isValidEmail, validateExpensePayload };
