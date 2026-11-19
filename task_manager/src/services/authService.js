
import api from "./api";
import { setToken, getToken, removeToken } from "./storageService";

// Login user
export async function login(username, password) {
  const response = await api.post("/auth/login", {
    username,
    password,
    expiresInMins: 30,
  });

  const { accessToken, refreshToken, ...user } = response.data;
  console.log(refreshToken)

  setToken(accessToken);

  return user;
}

// Get logged-in user
export async function getCurrentUser() {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await api.get("/auth/me");

  return response.data;
}

// Logout user
export function logout() {
  removeToken();
}
