
import api from "./axiosConfig";

const assetAPI = {
  // Fetch all assets (with pagination support if needed)
  getAll: async (params = {}) => {
    try {
      const res = await api.get("/assets", {
        params: { t: Date.now(), ...params }, // prevent cache + allow filters
      });
      return res.data.data || res.data || [];
    } catch (error) {
      console.error("Error fetching assets:", error.response?.data || error.message);
      return [];
    }
  },

  // Create new asset
  create: async (data) =>
    api.post("/assets", data).then((res) => res.data),

  // Get single asset for edit
  getById: async (id) =>
    api.get(`/assets/${id}/edit`).then((res) => res.data),

  // Update asset
  
 update: async (id, data, config = {}) =>
    api.post(`/assets/${id}`, data, config).then(res => res.data),

  // Delete asset
  remove: async (id) =>
    api.delete(`/assets/${id}`).then((res) => res.data),
};

export default assetAPI;

