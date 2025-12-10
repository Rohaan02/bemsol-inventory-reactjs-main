// src/lib/taxPayerTypeAPI.js
import api from "./axiosConfig";

const taxPayerTypeAPI = {
  getAll: async () => {
    try {
      const res = await api.get("/tax-payer-types", { params: { t: Date.now() } });
      return res.data.data || [];
    } catch (error) {
      console.error("Error fetching tax payer types:", error.response?.data || error.message);
      return [];
    }
  },
  
  getActive: async () => {
    try {
      const res = await api.get("/tax-payer-types/active", { params: { t: Date.now() } });
      return res.data.data || [];
    } catch (error) {
      console.error("Error fetching active tax payer types:", error.response?.data || error.message);
      return [];
    }
  },

  create: async (data) => api.post("/tax-payer-types", data).then(res => res.data),
  getById: async (id) => api.get(`/tax-payer-types/${id}`).then(res => res.data),
  update: async (id, data) => api.put(`/tax-payer-types/${id}`, data).then(res => res.data),
  remove: async (id) => api.delete(`/tax-payer-types/${id}`).then(res => res.data),
};

export default taxPayerTypeAPI;