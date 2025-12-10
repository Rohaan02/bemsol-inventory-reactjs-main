// src/lib/unitAPI.js
import api from "./axiosConfig";

const unitAPI = {
  getAll: async () => {
    const res = await api.get("/units", { params: { t: Date.now() } });
    return res.data.data || [];
  },
  create: async (data) => {
    const res = await api.post("/units", data);
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/units/${id}/edit`);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/units/${id}`, data);
    return res.data;
  },
  remove: async (id) => {
    const res = await api.delete(`/units/${id}`);
    return res.data;
  },
  getWeightUnits: async () => {
    const res = await api.get("/get-weight-units");
    return res.data.units;
  },
};

export default unitAPI;
