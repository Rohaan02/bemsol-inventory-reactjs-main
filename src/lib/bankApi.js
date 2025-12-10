import api from "./axiosConfig";
const bankApi = {
  getAll: async () => {
    try {
      const res = await api.get("/banks", { params: { t: Date.now() } });
      return res.data.data || [];
    } catch (error) {
      console.error("Error fetching banks:", error.response?.data || error.message);
      return [];
    }
  },
  create: async (data) => api.post("/banks", data).then(res => res.data),
  getById: async (id) => api.get(`/banks/${id}/edit`).then(res => res.data),
  update: async (id, data) => api.put(`/banks/${id}`, data).then(res => res.data),
  remove: async (id) => api.delete(`/banks/${id}`).then(res => res.data),
};

export default bankApi;