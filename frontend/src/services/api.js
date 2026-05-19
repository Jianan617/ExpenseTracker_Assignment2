const API_BASE_URL = "http://localhost:5000/api";

//get the JWT token stored in the browser's localStorage
export function getToken() {
    return localStorage.getItem("expense_tracker_token");
}

//store the login session after successful login or registration
export function setStoredSession({ token, user }) {
    localStorage.setItem("expense_tracker_token", token);
    localStorage.setItem("expense_tracker_user", JSON.stringify(user));
}

//get the stored user information from localStorage
export function getStoredUser() {
    const raw = localStorage.getItem("expense_tracker_user");
    if (!raw) return null;
    try {
        //convert the stored JSON string back into an object
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

//clear the stored login session when user logs out
export function clearStoredSession() {
    localStorage.removeItem("expense_tracker_token");
    localStorage.removeItem("expense_tracker_user");
}

//build the Authorization header for protected API requests
export function authHeaders() {
    //if a token exists, attach it to the request header
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

//parse the backend response
export async function parseResponse(response) {
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.message || "Request failed.");
    }
    return result;
}

export default API_BASE_URL;
