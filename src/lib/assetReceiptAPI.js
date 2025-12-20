// src/lib/assetReceiptAPI.js
import api from "./axiosConfig";

const assetReceiptAPI = {
  getAll: async () => {
    try {
      const res = await api.get("/asset-receipts", {
        params: { t: Date.now() }, // prevent cache
      });
      console.log("Asset receiving response:", res.data);
      return Array.isArray(res.data.data) ? res.data.data : [];
    } catch (error) {
      console.error(
        "Error fetching asset receiving:",
        error.response?.data || error.message
      );
      return [];
    }
  },

  create: async (data) => {
    try {
      const res = await api.post("/asset-receipts", data);
      return res.data;
    } catch (error) {
      console.error(
        "Error creating asset receiving:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await api.get(`/asset-receipts/${id}`);
      return res.data;
    } catch (error) {
      console.error(
        "Error fetching asset receiving:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const res = await api.put(`/asset-receipts/${id}`, data);
      return res.data;
    } catch (error) {
      console.error(
        "Error updating asset receiving:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  remove: async (id) => {
    try {
      const res = await api.delete(`/asset-receipts/${id}`);
      return res.data;
    } catch (error) {
      console.error(
        "Error deleting asset receiving:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export default assetReceiptAPI;
