// src/lib/categoryAPI.js
import api from "./axiosConfig";

const conditionAPI = {
  // Get all categories (flat list)
  getAll: async () => {
    try {
      const res = await api.get("/conditions", {
        params: { t: Date.now() }, // avoid cache
      });
      return res.data.data || [];
    } catch (error) {
      console.error(
        "Error fetching Condition:",
        error.response?.data || error.message
      );
      return [];
    }
  },

  

  // Create category
  create: async (data) => {
    try {
      const res = await api.post("/conditions", data);
      return res.data;
    } catch (error) {
      console.error("Error creating category:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get single category by ID (edit)
  getById: async (id) => {
    try {
      const res = await api.get(`/conditions/${id}/edit`);
      return res.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Update category
    update: async (id, data) => api.put(`/conditions/${id}`, data).then(res => res.data),

  // Delete category
  remove: async (id) => {
    try {
      const res = await api.delete(`/conditions/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error deleting conditions:", error.response?.data || error.message);
      throw error;
    }
  },

  
};

// Helper function for API errors
const handleApiError = (error) => {
  console.error("API Error:", error.response?.data || error.message);
  throw error;
};

export default conditionAPI;