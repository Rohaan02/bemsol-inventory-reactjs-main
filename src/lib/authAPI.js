// src/lib/authAPI.js
import api from './axiosConfig';

export const authAPI = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data; // { token, user }
  },

  register: async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await api.get('/user');
    return res.data;
  },

  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
  
  // Get all categories
 




  
};

// --- Helper for consistent error handling ---
function handleApiError(error) {
  if (error.response) {
    // Server responded with error (422, 404, 500 etc.)
    throw {
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // No response from server
    throw { status: null, message: 'No response from server' };
  } else {
    // Something else happened
    throw { status: null, message: error.message };
  }
}




export { api };