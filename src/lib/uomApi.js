import api from "./axiosConfig";

const uomApi = {
  getUomList: async () => {
    const response = await api.get('/uom');
    return response.data;
  },
  getUomById: async (id) => {
    const response = await api.get(`/uom/${id}`);
    return response.data;
  },
  createUom: async (data) => {
    const response = await api.post('/uom', data);
    return response.data;
  },
  updateUom: async (id, data) => {
    const response = await api.put(`/uom/${id}`, data);
    return response.data;
  },
  deleteUom: async (id) => {
    const response = await api.delete(`/uom/${id}`);
    return response.data;
  },
};

export default uomApi;