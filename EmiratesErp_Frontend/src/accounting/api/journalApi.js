import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const journalApi = {
  getAll:       (params) => axios.get(`${API_URL}/accounts/journal`, { ...authHeaders(), params }),
  getById:      (id)     => axios.get(`${API_URL}/accounts/journal/${id}`, authHeaders()),
  create:       (data)   => axios.post(`${API_URL}/accounts/journal`, data, authHeaders()),
  update:       (id, d)  => axios.put(`${API_URL}/accounts/journal/${id}`, d, authHeaders()),
  post:         (id)     => axios.post(`${API_URL}/accounts/journal/${id}/post`, {}, authHeaders()),
  reverse:      (id)     => axios.post(`${API_URL}/accounts/journal/${id}/reverse`, {}, authHeaders()),
  delete:       (id)     => axios.delete(`${API_URL}/accounts/journal/${id}`, authHeaders()),
};
