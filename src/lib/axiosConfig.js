// src/lib/axiosConfig.js
import axios from "axios";
import baseUrl from "./BaseUrl";

// ngrok url
const API_BASE_URL = baseUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Attach token automatically if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
