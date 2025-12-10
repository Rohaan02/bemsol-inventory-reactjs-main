import api from "./axiosConfig";

const userAPI = {
  getAll: async (page = 1, search = "") => {
    try {
      const res = await api.get("/users", { params: { page, search } });
      return res.data;
    } catch (error) {
      console.error("Error fetching users:", error.response?.data || error.message);
      return { data: [], total: 0 };
    }
  },

  getById: async (id) => {
    try {
      const res = await api.get(`/users/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching user:", error.response?.data || error.message);
      return null;
    }
  },

  
  create: async (data) => api.post("/auth/register", data).then(res => res.data),

  update: async (id, data) => {
    try {
      const res = await api.put(`/users/${id}`, data);
      return res.data;
    } catch (error) {
      console.error("Error updating user:", error.response?.data || error.message);
      return null;
    }
  },

  resetPassword: async (id, newPassword) => {
    try {
      const res = await api.post(`/users/${id}/reset-password`, { password: newPassword });
      return res.data;
    } catch (error) {
      console.error("Error resetting password:", error.response?.data || error.message);
      return null;
    }
  },

  updatePermissions: async (id, permissions) => {
    try {
      const res = await api.put(`/users/${id}/permissions`, { permissions });
      return res.data;
    } catch (error) {
      console.error("Error updating permissions:", error.response?.data || error.message);
      return null;
    }
  },
  // Fetch all roles from backend
  getRoles: async () => {
    try {
      const res = await api.get("/roles");
      return res.data; // Expect backend to return [{ id, name }, ...]
    } catch (error) {
      console.error("Error fetching roles:", error.response?.data || error.message);
      return [];
    }
  },
};

export default userAPI;
