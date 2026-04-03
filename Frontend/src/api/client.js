import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function formatApiError(error, fallback = "Something went wrong") {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message === "Network Error")
    return "Cannot connect to server. Check your connection.";
  if (error?.code === "ECONNABORTED")
    return "Request timed out. Please try again.";
  return fallback;
}

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      const key = "vehicle_vault_auth";
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        delete api.defaults.headers.common.Authorization;
        window.dispatchEvent(new CustomEvent("vv:unauthorized"));
      }
    }
    return Promise.reject(error);
  },
);
