export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");

const TOKEN_KEY = "questlog_token";
const USER_KEY = "questlog_user";

// Shared API helper attaches the JWT when present and normalizes JSON errors.
export async function apiRequest(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    Accept: "application/json",
    ...options.headers,
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
}

// Auth endpoints persist both token and safe user profile after successful responses.
async function authRequest(path, payload) {
  const data = await apiRequest(`/auth${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload,
  });

  if (data.access_token) {
    localStorage.setItem(TOKEN_KEY, data.access_token);
  }

  if (data.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  return data;
}

export function registerUser({ username, email, password }) {
  return authRequest("/register", { username, email, password });
}

export function loginUser({ email, password }) {
  return authRequest("/login", { email, password });
}

export async function fetchCurrentUser() {
  const data = await apiRequest("/auth/me");
  const user = data.user || data;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}
