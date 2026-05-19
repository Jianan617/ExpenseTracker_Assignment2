import API_BASE_URL, { authHeaders, parseResponse } from "./api";

//fetch all available expense categories from the backend
export async function getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: { ...authHeaders() },
    });
    const result = await parseResponse(response);
    return result.data;
}

//create a new category
export async function createCategory(name) {
    const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ name }),
    });
    const result = await parseResponse(response);
    return result.data;
}


//update an existing category by id
export async function updateCategory(id, name) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ name }),
    });
    const result = await parseResponse(response);
    return result.data;
}

//delete an existing category by id
export async function deleteCategory(id) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
}
