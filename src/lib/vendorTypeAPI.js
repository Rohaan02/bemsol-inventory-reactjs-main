// src/lib/vendorTypeAPI.js
import api from "./axiosConfig";

const vendorTypeAPI = {
  getAll: async () => {
    try {
      const res = await api.get("/vendor-types", { params: { t: Date.now() } });
      return res.data.data || [];
    } catch (error) {
      console.error("Error fetching vendor types:", error.response?.data || error.message);
      return [];
    }
  },
  
  getActive: async () => {
    try {
      const res = await api.get("/vendor-types/active", { params: { t: Date.now() } });
      return res.data.data || [];
    } catch (error) {
      console.error("Error fetching active vendor types:", error.response?.data || error.message);
      return [];
    }
  },

  create: async (data) => api.post("/vendor-types", data).then(res => res.data),
  getById: async (id) => api.get(`/vendor-types/${id}`).then(res => res.data),
  update: async (id, data) => api.put(`/vendor-types/${id}`, data).then(res => res.data),
  remove: async (id) => api.delete(`/vendor-types/${id}`).then(res => res.data),
};

export default vendorTypeAPI;