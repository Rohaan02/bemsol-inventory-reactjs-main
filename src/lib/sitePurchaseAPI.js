// lib/sitePurchaseAPI.js

import api from "./axiosConfig";

const sitePurchaseAPI = {
  // Get all site purchases with optional filtering and pagination
  getAll: async (filters = {}, page = 1, perPage = 15) => {
    const params = {
      page,
      per_page: perPage,
      ...filters,
      t: Date.now() // Cache busting
    };
    
    const res = await api.get("/site-purchases", { params });
    return res.data;
  },

  // Create new site purchase
  create: async (data) => {
    const res = await api.post("/site-purchases", data);
    return res.data;
  },

  // Get site purchase by ID
  getById: async (id) => {
    const res = await api.get(`/site-purchases/${id}`);
    return res.data;
  },

  // Update site purchase
  update: async (id, data) => {
    const res = await api.put(`/site-purchases/${id}`, data);
    return res.data;
  },

  // Delete site purchase
  remove: async (id) => {
    const res = await api.delete(`/site-purchases/${id}`);
    return res.data;
  },

  // Get purchases by demand number
  getByDemandNo: async (demandNo) => {
    const res = await api.get(`/site-purchases/demand/${demandNo}`);
    return res.data;
  },

  // Get purchase status options
  getStatusOptions: () => [
    { value: 'pending', label: 'Pending' },
    { value: 'purchase', label: 'Purchase' },
    { value: 'partial_purchase', label: 'Partial Purchase' },
    { value: 'received', label: 'Received' },
  ],
};

export default sitePurchaseAPI;