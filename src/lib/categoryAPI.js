// src/lib/categoryAPI.js
import api from "./axiosConfig";

const categoryAPI = {
  // Get all categories (flat list)
  getAllCategories: async () => {
    try {
      const res = await api.get("/category", {
        params: { t: Date.now() }, // avoid cache
      });
      return res.data.data || [];
    } catch (error) {
      console.error(
        "Error fetching categories:",
        error.response?.data || error.message
      );
      return [];
    }
  },

  // Get category tree (hierarchical)
  getCategoryTree: async () => {
    try {
      const res = await api.get("/category-tree", {
        params: { t: Date.now() },
      });
      return res.data;
    } catch (error) {
      console.error(
        "Error fetching category tree:",
        error.response?.data || error.message
      );
      return { success: false, data: [] };
    }
  },

  // Get hierarchical categories for dropdown
  getHierarchicalCategories: async () => {
    try {
      const res = await api.get("/hierarchical-categories");
      return res.data;
    } catch (error) {
      console.error(
        "Error fetching hierarchical categories:",
        error.response?.data || error.message
      );
      return { success: false, data: [] };
    }
  },

  // Create category
  create: async (data) => {
    try {
      const res = await api.post("/category", data);
      return res.data;
    } catch (error) {
      console.error("Error creating category:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get single category by ID (edit)
  getById: async (id) => {
    try {
      const res = await api.get(`/category/${id}/edit`);
      return res.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Update category
  update: async (id, data) => {
    try {
      const res = await api.put(`/category/${id}`, data);
      return res.data;
    } catch (error) {
      console.error("Error updating category:", error.response?.data || error.message);
      throw error;
    }
  },

  // Delete category
  remove: async (id) => {
    try {
      const res = await api.delete(`/category/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error deleting category:", error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get subcategories
  getSubcategories: async (id) => {
    try {
      const res = await api.get(`/categories/${id}/subcategories`);
      return res.data;
    } catch (error) {
      console.error("Error fetching subcategories:", error.response?.data || error.message);
      return { success: false, data: [] };
    }
  }, // ← Added comma here

  // Get only leaf categories (without children) for item creation
  getLeafCategories: async () => {
    try {
      const res = await api.get("/category/leaves", {
        params: { t: Date.now() },
      });
      return res.data.data || [];
    } catch (error) {
      console.error(
        "Error fetching leaf categories:",
        error.response?.data || error.message
      );
      return [];
    }
  }, // ← Added comma here

  // Get all categories with leaf flag
  getCategoriesWithLeafFlag: async () => {
    try {
      const res = await api.get("/category/with-leaf-flag", {
        params: { t: Date.now() },
      });
      return res.data.data || [];
    } catch (error) {
      console.error(
        "Error fetching categories with leaf flag:",
        error.response?.data || error.message
      );
      return [];
    }
  }, // ← Added comma here (optional for the last item, but good practice)
};

// Helper function for API errors
const handleApiError = (error) => {
  console.error("API Error:", error.response?.data || error.message);
  throw error;
};


export default categoryAPI;