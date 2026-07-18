import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const authHeaders = (tenantId) => ({
  headers: { 
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'X-Tenant-ID': tenantId || localStorage.getItem('tenantId')
  }
});

export const bankApi = {
  getAllBanks:          (tenantId) => axios.get(`${API_URL}/accounts/banks`, authHeaders(tenantId)),
  createBank:           (data, tenantId) => axios.post(`${API_URL}/accounts/banks`, data, authHeaders(tenantId)),
  getBank:              (id, tenantId) => axios.get(`${API_URL}/accounts/banks/${id}`, authHeaders(tenantId)),
  
  getAllBankAccounts:   (tenantId) => axios.get(`${API_URL}/accounts/banks/accounts`, authHeaders(tenantId)),
  createBankAccount:    (data, tenantId) => axios.post(`${API_URL}/accounts/banks/accounts`, data, authHeaders(tenantId)),
  updateBankAccount:    (id, data, tenantId) => axios.put(`${API_URL}/accounts/banks/accounts/${id}`, data, authHeaders(tenantId)),
  getBankAccount:       (id, tenantId) => axios.get(`${API_URL}/accounts/banks/accounts/${id}`, authHeaders(tenantId)),
  getBankAccountsByBank:(bankId, tenantId) => axios.get(`${API_URL}/accounts/banks/${bankId}/accounts`, authHeaders(tenantId)),
};
