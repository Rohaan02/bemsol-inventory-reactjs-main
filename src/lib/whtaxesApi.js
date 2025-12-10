// src/lib/whtAPI.js
import api from "./axiosConfig";

const whtAPI = {
  getAll: async () => {
    try {
      const res = await api.get("/whts", { params: { t: Date.now() } });
      return res.data.data || [];
    } catch (error) {
      console.error("Error fetching WHTs:", error.response?.data || error.message);
      return [];
    }
  },
  
  getActive: async () => {
    try {
      const res = await api.get("/whts/active", { params: { t: Date.now() } });
      return res.data.data || [];
    } catch (error) {
      console.error("Error fetching active WHTs:", error.response?.data || error.message);
      return [];
    }
  },

  create: async (data) => api.post("/whts", data).then(res => res.data),
  getById: async (id) => api.get(`/whts/${id}`).then(res => res.data),
  update: async (id, data) => api.put(`/whts/${id}`, data).then(res => res.data),
  remove: async (id) => api.delete(`/whts/${id}`).then(res => res.data),
};

export default whtAPI;