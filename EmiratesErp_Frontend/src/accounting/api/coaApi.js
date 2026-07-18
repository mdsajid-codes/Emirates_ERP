import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const coaApi = {
  getAll:             ()       => axios.get(`${API_URL}/accounts/coa`, authHeaders()),
  getById:            (id)     => axios.get(`${API_URL}/accounts/coa/${id}`, authHeaders()),
  getTree:            ()       => axios.get(`${API_URL}/accounts/coa/tree`, authHeaders()),
  getByCode:          (code)   => axios.get(`${API_URL}/accounts/coa/code/${code}`, authHeaders()),
  getSectionDropdown: ()       => axios.get(`${API_URL}/accounts/coa/dropdown/sections`, authHeaders()),
  getParentGroupDropdown: ()   => axios.get(`${API_URL}/accounts/coa/dropdown/parent-groups`, authHeaders()),
  create:             (data)   => axios.post(`${API_URL}/accounts/coa`, data, authHeaders()),
  update:             (id, data) => axios.put(`${API_URL}/accounts/coa/${id}`, data, authHeaders()),
  activate:           (id)     => axios.patch(`${API_URL}/accounts/coa/${id}/activate`, {}, authHeaders()),
  deactivate:         (id)     => axios.patch(`${API_URL}/accounts/coa/${id}/deactivate`, {}, authHeaders()),
  delete:             (id)     => axios.delete(`${API_URL}/accounts/coa/${id}`, authHeaders()),
};
