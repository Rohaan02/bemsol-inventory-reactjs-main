// src/pages/Manufacturers/manufacturersApi.js
import api from "@/lib/axiosConfig";

export const manufacturersApi = {
  getAll: async () => {
    try {
      const res = await api.get("/manufacturers", { params: { t: Date.now() } });
      return res.data.data || [];
    } catch (error) {
      console.error("Error fetching manufacturers:", error.response?.data || error.message);
      return [];
    }
  },

  create: async (data) => api.post("/manufacturers", data).then(res => res.data),
  
  getById: async (id) => {
    try {
      const res = await api.get(`/manufacturers/${id}`);
      return res.data.data || null;
    } catch (error) {
      console.error("Error fetching manufacturer:", error.response?.data || error.message);
      throw error;
    }
  },
  
  update: async (id, data) => api.put(`/manufacturers/${id}`, data).then(res => res.data),
  
  remove: async (id) => api.delete(`/manufacturers/${id}`).then(res => res.data),
};