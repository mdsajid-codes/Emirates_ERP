import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const partyGlApi = {
  getAll:        ()          => axios.get(`${API_URL}/accounts/party-gl`, authHeaders()),
  getByTypeAndId: (type, id) => axios.get(`${API_URL}/accounts/party-gl/${type}/${id}`, authHeaders()),
  save:          (data)      => axios.post(`${API_URL}/accounts/party-gl`, data, authHeaders()),
  delete:        (id)        => axios.delete(`${API_URL}/accounts/party-gl/${id}`, authHeaders()),
};
