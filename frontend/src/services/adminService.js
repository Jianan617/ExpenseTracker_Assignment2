import API_BASE_URL, { authHeaders, parseResponse } from "./api";

export async function getUsers() {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { ...authHeaders() },
    });
    const result = await parseResponse(response);
    return result.data;
}

export async function updateUser(id, userData) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(userData),
    });
    const result = await parseResponse(response);
    return result.data;
}

export async function deleteUser(id) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
}

export async function getActivities() {
    const response = await fetch(`${API_BASE_URL}/admin/activities`, {
        headers: { ...authHeaders() },
    });
    const result = await parseResponse(response);
    return result.data;
}
