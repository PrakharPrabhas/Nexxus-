const API_BASE = "http://localhost:5000/api";
const AUTH_KEY = "nexus_admin_token";
const ADMIN_KEY = "nexus_admin_user";

async function api(endpoint, options = {}) {
    const token = sessionStorage.getItem(AUTH_KEY);
    const url = `${API_BASE}${endpoint}`;

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error(
            `Server returned non-JSON response (${response.status}) for ${endpoint}`
        );
    }

    if (!response.ok) {
        const onAdminPage = window.location.pathname.includes("/admin/");
        const onLoginPage = /login\.html$/i.test(window.location.pathname);

        if (response.status === 401 && onAdminPage && !onLoginPage) {
            sessionStorage.removeItem(AUTH_KEY);
            sessionStorage.removeItem(ADMIN_KEY);
            window.location.href = "login.html";
        }

        throw new Error(data.message || "API request failed");
    }

    return data;
}
