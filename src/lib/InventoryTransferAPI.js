// src/lib/InventoryTransferAPI.js
import api from "./axiosConfig";

const inventoryTransferAPI = {
  getAll: async () => {
    try {
      const res = await api.get("/inventory-transfers", { params: { t: Date.now() } });
      return res.data.data || [];
    } catch (error) {
      console.error("Error fetching inventory transfers:", error.response?.data || error.message);
      return [];
    }
  },

 create: async (data) => {
    
  try {
    console.log('Data before sending to API:', data);

    const res = await api.post("/inventory-transfers", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error creating inventory transfer:", error.response?.data || error.message);
    throw error;
  }
},


  getById: async (id) => {
    try {
      const res = await api.get(`/inventory-transfers/${id}`);
      return res.data.data;
    } catch (error) {
      console.error("Error fetching inventory transfer:", error.response?.data || error.message);
      throw error;
    }
  },

  getStock: async (itemId, locationId) => {
    try {
      const res = await api.get(`/inventory/${itemId}/location/${locationId}/stock`);
      return res.data.data;
    } catch (error) {
      console.error("Error fetching stock:", error.response?.data || error.message);
      return { current_stock: 0 };
    }
  },

  getStockHistory: async (itemId, locationId) => {
    try {
      const res = await api.get(`/inventory/${itemId}/location/${locationId}/history`);
      return res.data.data || [];
    } catch (error) {
      console.error("Error fetching stock history:", error.response?.data || error.message);
      return [];
    }
  },
  // Get current stock for an item across all locations
  getItemStockAllLocations: async (itemId) => {
    try {
      const res = await api.get(`/inventory/${itemId}/stock`);
      return res.data.data || [];
    } catch (error) {
      console.error("Error fetching item stock across locations:", error.response?.data || error.message);
      return [];
    }
  },

 getInterTransferDemand: async (params = {}) => {
    try {
      const res = await api.get("/inter-transfers/get-all", { params });
      return res.data;
    } catch (error) {
      console.error("Error fetching inter transfer demand:", error.response?.data || error.message);
      throw error;
    }
  },
  getCounts: async () => {
    try {
      const res = await api.get("/inter-transfers/counts");
      return res.data;
    } catch (error) {
      console.error("Error fetching counts:", error.response?.data || error.message);
      throw error;
    }
  },
bulkUpdateStatus: async (demandIds, status) => {
  try {
    const res = await api.post("/inter-transfers/bulk-update-status", {
      demand_ids: demandIds,
      processing_status: status
    });
    return res.data;
  } catch (error) {
    console.error("Error updating bulk status:", error.response?.data || error.message);
    throw error;
  }
},
  // Get current stock for multiple locations at once
   getStockMultipleLocations: async (itemId, locationIds) => {
  try {
    const res = await api.post(`/inventory/${itemId}/stock-multiple`, {
      location_ids: locationIds
    });
    return res.data.data || [];
  } catch (error) {
    console.error("Error fetching stock for multiple locations:", error.response?.data || error.message);
    
    // Fallback: fetch individually
    const individualStocks = await Promise.all(
      locationIds.map(async (locationId) => {
        try {
          const stockData = await inventoryTransferAPI.getStock(itemId, locationId);
          return {
            location_id: locationId,
            current_stock: stockData.current_stock || 0
          };
        } catch (err) {
          console.error(`Error fetching stock for location ${locationId}:`, err);
          return {
            location_id: locationId,
            current_stock: 0
          };
        }
      })
    );
    
    return individualStocks;
  }
}
  
};

export default inventoryTransferAPI;