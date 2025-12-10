// lib/vehicleAPI.js

import api from "./axiosConfig";

const vehicleAPI = {
  // Fetch all vehicles (with pagination support if needed)
  getAll: async (params = {}) => {
    try {
      const res = await api.get("/vehicles", {
        params: { t: Date.now(), ...params }, // prevent cache + allow filters
      });
      return res.data.data || res.data || [];
    } catch (error) {
      console.error("Error fetching vehicles:", error.response?.data || error.message);
      return [];
    }
  },

  // Create new vehicle
  create: async (data) =>
    api.post("/vehicles", data).then((res) => res.data),

  // Get single vehicle
  getById: async (id) =>
    api.get(`/vehicles/${id}`).then((res) => res.data),

  // Update vehicle
  update: async (id, data, config = {}) =>
    api.put(`/vehicles/${id}`, data, config).then(res => res.data),

  // Delete vehicle
  remove: async (id) =>
    api.delete(`/vehicles/${id}`).then((res) => res.data),

  // Update vehicle meter
  updateMeter: async (id, meter) =>
    api.put(`/vehicles/${id}/meter`, { current_meter: meter }).then(res => res.data),
};

export default vehicleAPI;