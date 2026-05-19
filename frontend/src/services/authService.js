import API_BASE_URL, { authHeaders, clearStoredSession, parseResponse, setStoredSession } from "./api";

//send login request to the backend
export async function loginUser(identifier, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        //tell the backend that the request body is JSON
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
    });
    const result = await parseResponse(response);
    //store the returned token and user in localStorage
    setStoredSession(result.data);
    return result.data.user;
}

//send registration request to the backend
export async function registerUser(username, email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
    });
    const result = await parseResponse(response);
    setStoredSession(result.data);
    return result.data.user;
}

export async function getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { ...authHeaders() },
    });
    const result = await parseResponse(response);
    return result.data;
}

export async function logoutUser() {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            headers: { ...authHeaders() },
        });
    } finally {
        clearStoredSession();
    }
}
