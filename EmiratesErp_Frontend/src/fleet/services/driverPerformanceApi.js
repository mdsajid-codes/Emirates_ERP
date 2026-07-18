import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`
});

export const driverPerformanceApi = {
  getAllPerformances: async (params = {}) => {
    const response = await axios.get(`${API_URL}/fleet/performance`, {
      params,
      headers: getHeaders()
    });
    return response.data;
  },

  getPerformanceById: async (id) => {
    const response = await axios.get(`${API_URL}/fleet/performance/${id}`, {
      headers: getHeaders()
    });
    return response.data;
  },

  calculateMetrics: async (driverId, period) => {
    const response = await axios.post(`${API_URL}/fleet/performance/calculate`, null, {
      params: { driverId, period },
      headers: getHeaders()
    });
    return response.data;
  },

  savePerformance: async (data) => {
    const response = await axios.post(`${API_URL}/fleet/performance`, data, {
      headers: getHeaders()
    });
    return response.data;
  },

  deletePerformance: async (id) => {
    const response = await axios.delete(`${API_URL}/fleet/performance/${id}`, {
      headers: getHeaders()
    });
    return response.data;
  }
};
