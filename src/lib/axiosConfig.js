// src/lib/axiosConfig.js
import axios from "axios";

const API_BASE_URL = "https://f194cba6ecec.ngrok-free.app";
// const API_BASE_URL = "http://127.0.0.1:8000/api";
//const API_BASE_URL = "https://bemsolopex.devifyio.com/backend/public/api";

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
