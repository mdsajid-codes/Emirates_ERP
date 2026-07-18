import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const authHeaders = (tenantId) => ({
  headers: { 
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'X-Tenant-ID': tenantId || localStorage.getItem('tenantId')
  }
});

export const paymentApi = {
  getAll:       (tenantId) => axios.get(`${API_URL}/accounts/payments`, authHeaders(tenantId)),
  getRegister:  (tenantId) => axios.get(`${API_URL}/accounts/payments/register`, authHeaders(tenantId)),
  getById:      (id, tenantId) => axios.get(`${API_URL}/accounts/payments/${id}`, authHeaders(tenantId)),
  create:       (data, tenantId) => axios.post(`${API_URL}/accounts/payments`, data, authHeaders(tenantId)),
  post:         (id, tenantId) => axios.post(`${API_URL}/accounts/payments/${id}/post`, {}, authHeaders(tenantId)),
};
