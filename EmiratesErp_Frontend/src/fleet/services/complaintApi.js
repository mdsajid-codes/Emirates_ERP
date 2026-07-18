import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`
});

export const complaintApi = {
  getAllComplaints: async (params = {}) => {
    const response = await axios.get(`${API_URL}/fleet/complaints`, {
      params,
      headers: getHeaders()
    });
    return response.data;
  },

  getComplaintById: async (id) => {
    const response = await axios.get(`${API_URL}/fleet/complaints/${id}`, {
      headers: getHeaders()
    });
    return response.data;
  },

  createComplaint: async (data) => {
    const response = await axios.post(`${API_URL}/fleet/complaints`, data, {
      headers: getHeaders()
    });
    return response.data;
  },

  updateComplaint: async (id, data) => {
    const response = await axios.put(`${API_URL}/fleet/complaints/${id}`, data, {
      headers: getHeaders()
    });
    return response.data;
  },

  deleteComplaint: async (id) => {
    const response = await axios.delete(`${API_URL}/fleet/complaints/${id}`, {
      headers: getHeaders()
    });
    return response.data;
  },

  uploadAttachment: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_URL}/fleet/complaints/${id}/attachment`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};
