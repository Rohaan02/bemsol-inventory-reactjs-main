// src/lib/untrackItemAPI.js
import api from "./axiosConfig";

const untrackItemAPI = {
  getAll: async () => {
    try {
      const res = await api.get("/untracked-items", { params: { t: Date.now() } });
      return res.data || [];
    } catch (error) {
      console.error("Error fetching untracked items:", error.response?.data || error.message);
      return [];
    }
  },

  create: async (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "tracked_request") {
        formData.append(key, value ? 1 : 0);
      } else {
        formData.append(key, value);
      }
    });

    return await api.post("/untracked-items", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getById: async (id) =>
    api.get(`/untracked-items/${id}`).then((res) => res.data),

  update: (id, data) => api.post(`/untracked-items/${id}?_method=PUT`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
}),


  remove: async (id) =>
    api.delete(`/untracked-items/${id}`).then((res) => res.data),
  // bulk import
bulkImport: (formData) =>
  api.post(`/untracked-items/bulk-import`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(res => res.data),


};

export default untrackItemAPI;
