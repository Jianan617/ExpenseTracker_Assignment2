import API_BASE_URL, { authHeaders, parseResponse } from "./api";

//fetch all users from the admin API
export async function getUsers() {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
        //attach JWT token to prove the current user is logged in and has admin access
        headers: { ...authHeaders() },
    });
    const result = await parseResponse(response);
    return result.data;
}

//update a specific user's information
export async function updateUser(id, userData) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json", //specify the content type is json
            ...authHeaders() //attach JWT token for authentication and admin authorization
        },
        //convert the object into a JSON string before sending it to the backend
        body: JSON.stringify(userData),
    });
    const result = await parseResponse(response);
    return result.data;
}

//delete a specific user by id
export async function deleteUser(id) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: "DELETE",
        //attach JWT token to ensure only an authenticated admin can delete users
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
}

//fetch all user activity logs
export async function getActivities() {
    const response = await fetch(`${API_BASE_URL}/admin/activities`, {
        //attach JWT token because activity logs are only for admin to acess
        headers: { ...authHeaders() },
    });
    const result = await parseResponse(response);
    return result.data;
}
