import api from "./axiosConfig";

const marketPurchaseApi = {
  // Get all market purchases with optional filtering and pagination
  getAll: async (filters = {}, page = 1, perPage = 15) => {
    const params = {
      page,
      per_page: perPage,
      ...filters,
      t: Date.now() // Cache busting
    };
    
    const res = await api.get("/market-purchases", { params });
    return res.data;
  },
  // Get minimal columns for MPN views
  getMinimalColumns: async (filters = {}, page = 1, perPage = 15) => {
    const params = {
      page,
      per_page: perPage,
      ...filters,
      t: Date.now()
    };
    
    const res = await api.get("/market-purchases/get-by-mpn", { params });
    return res.data;
  },

  // Get filter counts
  getCounts: async () => {
    const res = await api.get("/market-purchases/counts", {
      params: { t: Date.now() }
    });
    return res.data;
  },

  // Get single market purchase
  getById: async (id) => {
    const res = await api.get(`/market-purchases/${id}`);
    return res.data;
  },
  getMarketPurchaseFulfillmentTypes: async (demanId) => {
    const res = await api.get(`/market-purchases/get-fulfillment-demand/${demanId}`);
    return res.data;
  },
   // Update purchase details for multiple site demands
  storePurchaeSchedule: async (data) => {
    const res = await api.post("/market-purchases/store-purchase-schedule", data);
    return res.data;
  },
  getAllSchedules: async (filters = {}, page = 1, perPage = 15) => {
    const params = {
      page,
      per_page: perPage,
      ...filters,
      t: Date.now()
    };
    
    const res = await api.get("/market-purchases/get-all-purchase-schedules", { params });
    return res.data;
  },
  getCounts: async () => {
    try {
      const res = await api.get("/market-purchases/counts");
      return res.data;
    } catch (error) {
      console.error("Error fetching counts:", error);
      return {};
    }
  },
  updateScheduleEstimate: async (data) => {
  const res = await api.post("/market-purchases/update-estimate-rate", data);
  return res.data;
},
createMarketPurchase: async (formData, config = {}) => {
  try {
    const response = await api.post('/market-purchases/create-market-purchase', formData, config);
    return response.data;
  } catch (error) {
    throw error;
  }
},
// Add to MarketPurchaseApi.js
getScheduleRemainingQty: async (scheduleId) => {
  try {
    const response = await api.get(`/market-purchases/schedule-remaining-qty/${scheduleId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
},
getPendingMPN: async () => {
  try {
    const response = await api.get(`/market-purchases/pending-mpn`);
    return response.data;
  } catch (error) {
    throw error;
  }
},
getMPNData: async () => {
  try {
    const response = await api.get(`/market-purchases/get-mpn-data`);
    return response.data;
  } catch (error) {
    throw error;
  }
},
getCountMarketPurchase: async () => {
  try {
    const response = await api.get(`/market-purchases/get-counts`);
    return response.data;
  } catch (error) {
    throw error;
  }
},
generateMPN: async (data) => {
  const res = await api.post("/market-purchases/generate-mpn", data);
  return res.data;
},
 getOrderedData: async (filters = {}, page = 1, perPage = 15) => {
    const params = {
      page,
      per_page: perPage,
      ...filters,
      t: Date.now()
    };
    
    const res = await api.get("/market-purchases/get-orderred-data", { params });
    return res.data;
  },
  //market ordered received
  receiveBulkOrders: async (ordersData) => {
    try {
      const response = await api.post('/market-purchase-orders/bulk-receive', ordersData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  receiveSingleOrder: async (orderData) => {
    try {
      const formData = new FormData();
      Object.keys(orderData).forEach(key => {
        if (orderData[key] !== null && orderData[key] !== undefined) {
          formData.append(key, orderData[key]);
        }
      });

      const response = await api.post('/market-purchase-orders/receive', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getFullMarketPurchaseDetails: async (id) => {
    try {
      const response = await api.get(`/market-purchases/${id}/full-details`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default marketPurchaseApi;