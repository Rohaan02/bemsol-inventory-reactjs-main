// src/lib/settingsAPI.js
import api from "./axiosConfig";

const settingsAPI = {
  getAll: async () => {
    try {
      const res = await api.get("/settings", { params: { t: Date.now() } });
      console.log('setting data',res.data);
      return res.data || [];
    } catch (error) {
      console.error("Error fetching settings:", error.response?.data || error.message);
      return [];
    }
  },

  getByKey: async (key) => {
    try {
      const res = await api.get(`/settings/${key}`);
      return res.data.data || null;
    } catch (error) {
      console.error(`Error fetching setting ${key}:`, error.response?.data || error.message);
      return null;
    }
  },

  update: async (key, data) => {
    try {
      const res = await api.put(`/settings/${key}`, data);
      return res.data;
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error.response?.data || error.message);
      return null;
    }
  }
};

export default settingsAPI;
