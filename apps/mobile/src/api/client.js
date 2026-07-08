import axios from "axios";
import { Platform } from "react-native";
import { auth } from "./firebase";

export const API_BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:4000/api" : "http://localhost:4000/api";

export const customerApi = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });
export const hostApi = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });

async function injectFirebaseToken(config) {
  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken(true);
      config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {
      console.warn("Failed to get Firebase token", e);
    }
  }
  return config;
}

customerApi.interceptors.request.use(injectFirebaseToken, (err) => Promise.reject(err));
hostApi.interceptors.request.use(injectFirebaseToken, (err) => Promise.reject(err));

export function serverMessage(error) {
  if (error.response && error.response.data && error.response.data.error) {
    return error.response.data.error;
  }
  return error.message || "An unexpected error occurred.";
}
