import axios from "axios";
import { auth } from "../firebase/client";
import { API_BASE_URL } from "../../config/env";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function apiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        return "The backend took too long to complete this request. Coding submissions can take up to two minutes; please try again if no result appears.";
      }
      return `Cannot connect to the backend at ${API_BASE_URL}. Start the Flask server and try again.`;
    }
    return error.response?.data?.error || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
