import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const itemGlApi = {
  getAll:    ()       => axios.get(`${API_URL}/accounts/item-gl`, authHeaders()),
  getByItem: (itemId) => axios.get(`${API_URL}/accounts/item-gl/${itemId}`, authHeaders()),
  save:      (data)   => axios.post(`${API_URL}/accounts/item-gl`, data, authHeaders()),
  delete:    (id)     => axios.delete(`${API_URL}/accounts/item-gl/${id}`, authHeaders()),
};
