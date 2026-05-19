import API_BASE_URL, { authHeaders, parseResponse } from "./api";

export async function getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: { ...authHeaders() },
    });
    const result = await parseResponse(response);
    return result.data;
}

export async function createCategory(name) {
    const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ name }),
    });
    const result = await parseResponse(response);
    return result.data;
}

export async function updateCategory(id, name) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ name }),
    });
    const result = await parseResponse(response);
    return result.data;
}

export async function deleteCategory(id) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
}
