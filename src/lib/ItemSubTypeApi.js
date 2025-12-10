// src/lib/subTypeAPI.js
import api from "./axiosConfig";

const ItemsubTypeAPI = {
  getAll: async () => {
    try {
      const res = await api.get("/item-sub-types", { params: { t: Date.now() } });
      return res.data.data || [];
    } catch (error) {
      console.error("Error fetching sub types:", error.response?.data || error.message);
      return [];
    }
  },
  getItemType: async () => {
    try {
      const res = await api.get("/item-types", { params: { t: Date.now() } });
      return res.data.data || [];
    } catch (error) {
      console.error("Error fetching types:", error.response?.data || error.message);
      return [];
    }
  },
  create: async (data) => api.post("/item-sub-types", data).then(res => res.data),
  getById: async (id) => api.get(`/item-sub-types/${id}/edit`).then(res => res.data),
  update: async (id, data) => api.put(`/item-sub-types/${id}`, data).then(res => res.data),
  remove: async (id) => api.delete(`/item-sub-types/${id}`).then(res => res.data),
};

export default ItemsubTypeAPI;
