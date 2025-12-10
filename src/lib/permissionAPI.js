// src/lib/permissionAPI.js
import api from "./axiosConfig";

const permissionAPI = {
  // get all system permissions + user’s assigned ones
  getByUser: async (userId) => {
    try {
      const res = await api.get(`/users/${userId}/permissions`);
      return res.data || { permissions: [], userPermissions: [] };
    } catch (error) {
      console.error(
        `Error fetching permissions for user ${userId}:`,
        error.response?.data || error.message
      );
      return { permissions: [], userPermissions: [] };
    }
  },

  // update user permissions
  update: async (userId, permissions) => {
    try {
      const res = await api.post(`/users/${userId}/permissions`, {
        permissions,
      });
      return res.data;
    } catch (error) {
      console.error(
        `Error updating permissions for user ${userId}:`,
        error.response?.data || error.message
      );
      return null;
    }
  },
  getAll: async () => {
    try {
      const res = await api.get("/permission");
      return res.data.data || [];
    } catch (error) {
      console.error("Error fetching permissions:", error.response?.data || error.message);
      return [];
    }
  },
  create: async (data) => api.post("/permission", data).then(res => res.data),
  getById: async (id) => api.get(`/permission/${id}`).then(res => res.data),
  update: async (id, data) => api.put(`/permission/${id}`, data).then(res => res.data),
};

export default permissionAPI;
