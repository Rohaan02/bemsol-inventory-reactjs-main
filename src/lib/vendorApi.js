import api from "./axiosConfig";

const vendorAPI = {
  // Get all vendors (flat list)
  getAll: async () => {
    try {
      const res = await api.get("/vendors", {
        params: { t: Date.now() }, // avoid cache
      });
      return res.data.data || [];
    } catch (error) {
      console.error(
        "Error fetching vendors:",
        error.response?.data || error.message
      );
      return [];
    }
  },

  // Create vendor
  create: async (data) => {
    try {
      const res = await api.post("/vendors", data);
      return res.data;
    } catch (error) {
      console.error("Error creating vendor:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get single vendor by ID (edit)
  getById: async (id) => {
    try {
      const res = await api.get(`/vendors/${id}/edit`);
      return res.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Update vendor
  update: async (id, data) => {
    try {
      const res = await api.put(`/vendors/${id}`, data);
      return res.data;
    } catch (error) {
      console.error("Error updating vendor:", error.response?.data || error.message);
      throw error;
    }
  },

  // Delete vendor
  remove: async (id) => {
    try {
      const res = await api.delete(`/vendors/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error deleting vendor:", error.response?.data || error.message);
      throw error;
    }
  },
  getCashVendor: async () => {
    try {
      const res = await api.get("/get-cash-vendors");
      return res.data;
    } catch (error) {
      console.error("Error fetching cash vendor:", error.response?.data || error.message);
      return [];
    }
  },
};

// Helper function for API errors
const handleApiError = (error) => {
  console.error("API Error:", error.response?.data || error.message);
  throw error;
};

export default vendorAPI;