import api from "./axiosConfig";

const siteDemandAPI = {
  // Get all site demands with optional filtering and pagination
  getAll: async (filters = {}, page = 1, perPage = 15) => {
  // Debug the incoming parameters
  console.log('🔍 DEBUG - getAll parameters:', {
    filters,
    page,
    perPage,
    perPageType: typeof perPage
  });
  
  const effectivePerPage = perPage === "all" ? 1000 : perPage;
  
  const params = {
    page: Number(page),
    per_page: Number(effectivePerPage), // Ensure it's a number
    ...filters
  };
  
  // Clean parameters
  Object.keys(params).forEach(key => {
    if (params[key] === undefined || params[key] === null || params[key] === '') {
      delete params[key];
    }
  });
  
  console.log('🚀 FINAL API PARAMS:', params);
  
  try {
    const res = await api.get("/site-demands", { params });
    console.log('✅ RAW API RESPONSE:', res);
    return res.data;
  } catch (error) {
    console.error('❌ API ERROR DETAILS:', {
      url: error.config?.url,
      params: error.config?.params,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
},

  // Create new site demand
  create: async (data) => {
    const res = await api.post("/site-demands", data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  // Get site demand by ID
  getById: async (id) => {
    const res = await api.get(`/site-demands/view/${id}`);
    return res.data;
  },

  // Update site demand
update: async (id, data) => {
  const res = await api.post(`/site-demands/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
},


  // Delete site demand
  remove: async (id) => {
    const res = await api.delete(`/site-demands/${id}`);
    return res.data;
  },

  // Restore soft deleted site demand
  restore: async (id) => {
    const res = await api.post(`/site-demands/${id}/restore`);
    return res.data;
  },

  // Get demands by status
  getByStatus: async (status, page = 1, perPage = 15) => {
    const params = {
      page,
      per_page: perPage,
      t: Date.now()
    };
    
    const res = await api.get(`/site-demands/status/${status}`, { params });
    return res.data;
  },

  // Update processing status only
  updateStatus: async (id, status) => {
    const res = await api.patch(`/site-demands/${id}/status`, { status });
    return res.data;
  },

  // Approval methods
approveBySiteManager: (id, data) => {
    console.log('API Client: approveBySiteManager', { id, data });
    
    // If data is FormData, let browser set Content-Type automatically
    if (data instanceof FormData) {
      return api.post(`/site-demands/${id}/approve-site-manager`, data);
    }
    
    // Default: send as JSON
    return api.post(`/site-demands/${id}/approve-site-manager`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  approveByInventoryManager: async (demandIds) => {
    console.log("===== APPROVE INVENTORY MANAGER =====");
    
    console.log("Raw demandIds:", demandIds);
    console.log("Type:", typeof demandIds);
    
    // If array: show elements
    if (Array.isArray(demandIds)) {
        console.log("Demand IDs array:", demandIds.join(", "));
    } else {
        console.log("🚨 demandIds is NOT an array!");
    }

    return api.post(
        "/site-demands/approve-inventory-manager",
        { demand_ids: demandIds },
        { headers: { "Content-Type": "application/json" } }
    );
},

  rejectDemand: async (id, remarks) => {
    const res = await api.post(`/site-demands/${id}/reject`, { remarks });
    return res.data;
  },

  // Notification methods
  getNotifications: async () => {
    const res = await api.get("/notifications", {
      params: { t: Date.now() }
    });
    return res.data;
  },

  markNotificationAsRead: async (notificationId) => {
    const res = await api.post(`/site-demands/notifications/${notificationId}/read`);
    return res.data;
  },

  markAllNotificationsAsRead: async () => {
    const res = await api.post("/site-demands/notifications/read-all");
    return res.data;
  },

  // Location-based stock and demand validation methods
  getStockInfo: async (inventoryItemId, locationId) => {
    try {
      const response = await api.get("/site-demands/stock-info", {
        params: { 
          inventory_item_id: inventoryItemId, 
          location_id: locationId 
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching stock info:', error);
      throw error;
    }
  },

  checkExistingDemand: async (inventoryItemId, locationId) => {
    try {
      const response = await api.get("/site-demands/check-existing", {
        params: { 
          inventory_item_id: inventoryItemId, 
          location_id: locationId 
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking existing demands:', error);
      throw error;
    }
  },

  // Get available options for dropdowns
  getOptions: async () => {
    return {
      priorities: ['Low', 'Medium', 'High', 'Urgent'],
      fulfillmentTypes: ['site_purchase', 'inter_store_transfer'],
      statuses: ['Pending', 'In Process', 'Completed', 'Rejected']
    };
  },
  getDemandByType: async () => {
    const res = await api.get(`/site-demands/get-demand-by-type`);
    return res.data;
  },
 


updateMarkPurchase:async (data) => {
  const res = await api.post("/site-demands/update-purchase-mark", data,{
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
},

 getStockFromLocation: async (id) => {
  try {
    const res = await api.get(`/site-demands/get-stock-from-location/${id}`);
    if (res.data.success) {
      return res.data;
    } else {
      throw new Error(res.data.message);
    }
  } catch (error) {
    console.error('Error fetching location stock:', error);
    throw error;
  }
},
 getSiteDemandLog: async (id) => {
  const res = await api.get(`/site-demands/get-user-logs-for-demand/${id}`);
  if (res.data.success) {
    return res.data;
  } else {
    throw new Error(res.data.message);
  }
}

};


export default siteDemandAPI;