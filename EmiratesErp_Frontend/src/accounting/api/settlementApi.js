import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const authHeaders = (tenantId) => ({
  headers: { 
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'X-TenantID': tenantId || localStorage.getItem('tenantId') // Note: Backend controller uses X-TenantID for settlements
  }
});

export const settlementApi = {
  getAll:       (tenantId) => axios.get(`${API_URL}/accounts/settlements`, authHeaders(tenantId)),
  getById:      (id, tenantId) => axios.get(`${API_URL}/accounts/settlements/${id}`, authHeaders(tenantId)),
  create:       (data, tenantId) => axios.post(`${API_URL}/accounts/settlements`, data, authHeaders(tenantId)),
  post:         (id, tenantId) => axios.post(`${API_URL}/accounts/settlements/${id}/post`, {}, authHeaders(tenantId)),
  reverse:      (id, tenantId) => axios.post(`${API_URL}/accounts/settlements/${id}/reverse`, {}, authHeaders(tenantId)),
};
