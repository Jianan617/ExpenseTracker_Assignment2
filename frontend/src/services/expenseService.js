import API_BASE_URL, { authHeaders, parseResponse } from "./api";

//get all expense records
export const getAllExpenses = async () => {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
        headers: { ...authHeaders() },
    });
    const result = await parseResponse(response);
    return result.data;
};

//create an expense record
export const createExpense = async (formData) => {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(formData),
    });
    const result = await parseResponse(response);
    return result.data;
};

//update an expense record by id
export const updateExpense = async (id, formData) => {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(formData),
    });
    const result = await parseResponse(response);
    return result.data;
};

//delete an expense record by id
export const deleteExpense = async (id) => {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
};
