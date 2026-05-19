const API_BASE_URL = "http://localhost:5000/api";

export function getToken() {
    return localStorage.getItem("expense_tracker_token");
}

export function setStoredSession({ token, user }) {
    localStorage.setItem("expense_tracker_token", token);
    localStorage.setItem("expense_tracker_user", JSON.stringify(user));
}

export function getStoredUser() {
    const raw = localStorage.getItem("expense_tracker_user");
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function clearStoredSession() {
    localStorage.removeItem("expense_tracker_token");
    localStorage.removeItem("expense_tracker_user");
}

export function authHeaders() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function parseResponse(response) {
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.message || "Request failed.");
    }
    return result;
}

export default API_BASE_URL;
