// src/lib/typeAPI.js
import api from "./axiosConfig";

const ItemtypeAPI = {
  getAll: async () => {
    try {
      const res = await api.get("/item-types", { params: { t: Date.now() } });
      return res.data.data || [];
    } catch (error) {
      console.error("Error fetching types:", error.response?.data || error.message);
      return [];
    }
  },
  create: async (data) => api.post("/item-types", data).then(res => res.data),
  getById: async (id) => api.get(`/item-types/${id}/edit`).then(res => res.data),
  update: async (id, data) => api.put(`/item-types/${id}`, data).then(res => res.data),
  remove: async (id) => api.delete(`/item-types/${id}`).then(res => res.data),
};

export default ItemtypeAPI;
