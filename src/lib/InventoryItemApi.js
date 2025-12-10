// src/lib/inventoryItemAPI.js
import api from "./axiosConfig";

const inventoryItemAPI = {
  getAll: async () => {
    try {
      const res = await api.get("/inventory-items", {
        params: { t: Date.now() }, // prevent cache
      });
      console.log("Inventory Items response:", res.data);

      return Array.isArray(res.data.data) ? res.data.data : [];
    } catch (error) {
      console.error(
        "Error fetching inventory items:",
        error.response?.data || error.message
      );
      return [];
    }
  },

  create: async (data) =>
    api.post("/inventory-items", data).then((res) => res.data),

  getById: async (id) =>
    api.get(`/inventory-items/${id}/edit`).then((res) => res.data),

  update: async (id, data) =>
    // Use POST with _method=PUT for FormData
    api.post(`/inventory-items/${id}?_method=PUT`, data).then((res) => res.data),

  remove: async (id) =>
    api.delete(`/inventory-items/${id}`).then((res) => res.data),
  
  // Tracking
  track: async (id) => {
    try {
      console.log(`📍 Tracking item locations for ID: ${id}`);
      const res = await api.get(`/inventory-items/tracking/${id}`);
      console.log("📍 Track API response:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Error tracking item locations:", {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  // Comments
  addComment: async (id, commentData) => {
    try {
      const res = await api.post(`/inventory-items/comments/${id}`, commentData);
      return res.data;
    } catch (error) {
      console.error("Error adding comment:", error.response?.data || error.message);
      throw error;
    }
  },

  getComments: async (id) => {
    try {
      const res = await api.get(`/inventory-items/${id}/comments`);
      return res.data;
    } catch (error) {
      console.error("Error fetching comments:", error.response?.data || error.message);
      throw error;
    }
  },

  // Documents
  addDocument: async (id, formData) => {
    try {
      const res = await api.post(`/inventory-items/documents/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return res.data;
    } catch (error) {
      console.error("Error adding document:", error.response?.data || error.message);
      throw error;
    }
  },

  getDocuments: async (id) => {
    try {
      const res = await api.get(`/inventory-items/${id}/documents`);
      return res.data;
    } catch (error) {
      console.error("Error fetching documents:", error.response?.data || error.message);
      throw error;
    }
  },

  // NEW: Location Management APIs
  getItemLocations: async (id) => {
    try {
      const res = await api.get(`/inventory-items/${id}/locations`);
      return res.data;
    } catch (error) {
      console.error("Error fetching item locations:", error.response?.data || error.message);
      throw error;
    }
  },

  addLocation: async (id, locationData) => {
    try {
      const res = await api.post(`/inventory-items/${id}/locations`, locationData);
      return res.data;
    } catch (error) {
      console.error("Error adding location:", error.response?.data || error.message);
      throw error;
    }
  },

  updateLocation: async (id, locationId, locationData) => {
    try {
      const res = await api.put(`/inventory-items/${id}/locations/${locationId}`, locationData);
      return res.data;
    } catch (error) {
      console.error("Error updating location:", error.response?.data || error.message);
      throw error;
    }
  },

  removeLocation: async (id, locationId) => {
    try {
      const res = await api.delete(`/inventory-items/${id}/locations/${locationId}`);
      return res.data;
    } catch (error) {
      console.error("Error removing location:", error.response?.data || error.message);
      throw error;
    }
  },

  // NEW: Reorder Alerts
  getItemsNeedingReorder: async () => {
    try {
      const res = await api.get('/inventory-items/alerts/reorder');
      return res.data;
    } catch (error) {
      console.error("Error fetching reorder alerts:", error.response?.data || error.message);
      throw error;
    }
  },
  // NEW: Update Status API
  updateStatus: async (id, isActive) => {
    try {
      const res = await api.patch(`/inventory-items/${id}/status`, {
        is_active: isActive
      });
      return res.data;
    } catch (error) {
      console.error("Error updating item status:", error.response?.data || error.message);
      throw error;
    }
  },
  bulkarcheive: async (ids) => {
    try {
      const res = await api.post(`/inventory-items/bulk-archive`, {
        ids
      });
      return res.data;
    } catch (error) {
      console.error("Error archiving items:", error.response?.data || error.message);
      throw error;
    }
  },
  getActiveItems: async () => {
    try {
      const res = await api.get('/inventory-items/active');
      return res.data;
    } catch (error) {
      console.error("Error fetching active items:", error.response?.data || error.message);
      throw error;
    }
  },
  getInvenotryAndNonInventoryItems: async () => {
    try {
      const res = await api.get('/inventory-items/get-all-items');
      return res.data;
    } catch (error) {
      console.error("Error fetching inventory and non-inventory items:", error.response?.data || error.message);
      throw error;
    }
  },
   createAdjustment: async (adjustmentData) => {
    const response = await api.post('/inventory-items/stock-adjustment', adjustmentData);
    return response;
  },
  getDraftPO: async (id) => {
    try {
      const res = await api.get(`/get-draft-po`);
      return res.data;
    } catch (error) {
      console.error("Error fetching draft PO:", error.response?.data || error.message);
      throw error;
    }
  },
  addItemtoExistingPO: async (data) => {
    try {
      const res = await api.post(`/add-item-to-existing-po`, data);
      return res.data;
    } catch (error) {
      console.error("Error adding item to existing PO:", error.response?.data || error.message);
      throw error;
    }
  },
  getActivity: async (id) => {
    try {
    const res = await api.get(`/inventory-items/activity`, { params: { inventory_item_id: id } });
    console.log('Activity Data:', res.data);
    return res.data;
  } catch (error) {
    console.error("Error fetching activity:", error.response?.data || error.message);
    throw error;
  }
  },

};

export default inventoryItemAPI;