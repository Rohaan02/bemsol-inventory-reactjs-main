import api from "./axiosConfig";

const purchaseOrderAPI = {
  // Get all purchase orders with optional filtering and pagination
  getAll: async (filters = {}, page = 1, perPage = 15) => {
    const params = {
      page,
      per_page: perPage,
      ...filters,
      t: Date.now() // Cache busting
    };
    
    const res = await api.get("/purchase-orders", { params });
    return res.data;
  },

  // Create new purchase order
  create: async (data) => {
    const res = await api.post("/purchase-orders", data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  // Get purchase order by ID
  getById: async (id) => {
    const res = await api.get(`/purchase-orders/${id}`);
    return res.data;
  },

  // Update purchase order
  update: async (id, data) => {
  // Only set Content-Type for FormData, let axios handle JSON automatically
  const config = {};
  
  if (data instanceof FormData) {
    // For FormData, let browser set the content type with boundary
    // Don't set Content-Type header manually
  } else {
    // For JSON data, axios will automatically set application/json
    config.headers = {
      'Content-Type': 'application/json',
    };
  }
  
  const res = await api.put(`/purchase-orders/${id}`, data, config);
  return res.data;
},

  // Delete purchase order
  remove: async (id) => {
    const res = await api.delete(`/purchase-orders/${id}`);
    return res.data;
  },

  // Get next PO number
  // In your purchaseOrderAPI
getNextPONumber: async () => {
  const res = await api.get('/purchase-orders/next-po-number');
  console.log('next po no.',res.data);
  return res.data;
},

  // Update status only
  updateStatus: async (id, status) => {
    const res = await api.patch(`/purchase-orders/${id}/status`, { status });
    return res.data;
  },

  // Delete attachment
  deleteAttachment: async (attachmentId) => {
    const res = await api.delete(`/purchase-orders/attachments/${attachmentId}`);
    return res.data;
  },

  // Get purchase orders by status
  getByStatus: async (status, page = 1, perPage = 15) => {
    const params = {
      page,
      per_page: perPage,
      status,
      t: Date.now()
    };
    
    const res = await api.get("/purchase-orders", { params });
    return res.data;
  },

  // Get purchase orders by vendor
  getByVendor: async (vendorId, page = 1, perPage = 15) => {
    const params = {
      page,
      per_page: perPage,
      vendor_id: vendorId,
      t: Date.now()
    };
    
    const res = await api.get("/purchase-orders", { params });
    return res.data;
  },

  // Get purchase orders by date range
  getByDateRange: async (startDate, endDate, page = 1, perPage = 15) => {
    const params = {
      page,
      per_page: perPage,
      start_date: startDate,
      end_date: endDate,
      t: Date.now()
    };
    
    const res = await api.get("/purchase-orders", { params });
    return res.data;
  },

  // Export purchase orders
  export: async (filters = {}) => {
    const params = {
      ...filters,
      t: Date.now()
    };
    
    const res = await api.get("/purchase-orders/export", { 
      params,
      responseType: 'blob'
    });
    return res.data;
  },

  // Get purchase order statistics
  getStats: async () => {
    const res = await api.get("/purchase-orders/stats", {
      params: { t: Date.now() }
    });
    return res.data;
  },
  // UPLOAD DOCUMENT
  uploadAttachments: async (id, formData) => {
    const res = await api.post(`/purchase-orders/${id}/attachments`, formData);
    return res.data;
  },

  // Get available options for dropdowns
  getOptions: async () => {
    return {
      intcoTerms: [
        { value: 'EXW', label: 'EXW - Ex Works' },
        { value: 'FCA', label: 'FCA - Free Carrier' },
        { value: 'FAS', label: 'FAS - Free Alongside Ship' },
        { value: 'FOB', label: 'FOB - Free On Board' },
        { value: 'CFR', label: 'CFR - Cost and Freight' },
        { value: 'CIF', label: 'CIF - Cost, Insurance and Freight' },
        { value: 'CPT', label: 'CPT - Carriage Paid To' },
        { value: 'CIP', label: 'CIP - Carriage and Insurance Paid To' },
        { value: 'DPU', label: 'DPU - Delivered at Place Unloaded' },
        { value: 'DAP', label: 'DAP - Delivered at Place' },
        { value: 'DDP', label: 'DDP - Delivered Duty Paid' }
      ],
      labels: [
        { value: 'urgent', label: 'Urgent' },
        { value: 'standard', label: 'Standard' },
        { value: 'low-priority', label: 'Low Priority' }
      ],
      statuses: [
        { value: 'draft', label: 'Draft' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'completed', label: 'Completed' }
      ],
      conditions: [
        { id: 'tax_inclusive', label: 'Tax Inclusive' },
        { id: 'free_delivery', label: 'Delivery is Free' },
        { id: 'amount_to_be_paid', label: 'Amount to be Paid' }
      ]
    };
  },

  // Validate purchase order data before submission
  validate: async (data) => {
    const res = await api.post("/purchase-orders/validate", data);
    return res.data;
  },

  // Duplicate purchase order
  duplicate: async (id) => {
    const res = await api.post(`/purchase-orders/${id}/duplicate`);
    return res.data;
  },

  // Send purchase order to vendor
  sendToVendor: async (id) => {
    const res = await api.post(`/purchase-orders/${id}/send-to-vendor`);
    return res.data;
  },

  // Get purchase order history/audit trail
  getHistory: async (id) => {
    const res = await api.get(`/purchase-orders/${id}/history`);
    return res.data;
  },
  getPendingPODemand: async (filters = {}, page = 1, perPage = 15) => {
    const params = {
      page,
      per_page: perPage,
      ...filters,
      t: Date.now() // Cache busting
    };
    
    const res = await api.get("/get-pending-po-demand", { params });
  return res.data;
  },
};

export default purchaseOrderAPI;