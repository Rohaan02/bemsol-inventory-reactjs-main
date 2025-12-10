// src/lib/accountAPI.js
import api from "./axiosConfig";

const accountAPI = {
  getAll: async () => {
    try {
      const res = await api.get("/accounts", { params: { t: Date.now() } });
      return res.data.data || [];
    } catch (error) {
      console.error("Error fetching accounts:", error.response?.data || error.message);
      return [];
    }
  },
  create: async (data) => api.post("/accounts", data).then(res => res.data),
  getById: async (id) => api.get(`/accounts/${id}/edit`).then(res => res.data),
  update: async (id, data) => api.put(`/accounts/${id}`, data).then(res => res.data),
  remove: async (id) => api.delete(`/accounts/${id}`).then(res => res.data),
};

export default accountAPI;
