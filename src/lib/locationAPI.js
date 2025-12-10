// src/lib/locationAPI.js
import api from "./axiosConfig";

const locationAPI = {
  getAll: async () => {
    try {
      const res = await api.get("/locations", { params: { t: Date.now() } });
      console.log("Locations response:", res.data.data); // ✅ Debug log
      return res.data.data || [];
      
    } catch (error) {
      console.error("Error fetching locations:", error.response?.data || error.message);
      return [];
    }
  },
  create: async (data) => api.post("/locations", data).then(res => res.data),
  getById: async (id) => api.get(`/locations/${id}/edit`).then(res => res.data),
  update: async (id, data) => api.put(`/locations/${id}`, data).then(res => res.data),
  remove: async (id) => api.delete(`/locations/${id}`).then(res => res.data),
  getAuthLocations: async () => {
    try {
      const res = await api.get("/auth/locations", { params: { t: Date.now() } });
      console.log("Auth Locations response:", res.data.data); // ✅ Debug log
      return res.data.data || [];
    } catch (error) {
      console.error("Error fetching auth locations:", error.response?.data || error.message);
      return [];
    }
  },
};

export default locationAPI;
