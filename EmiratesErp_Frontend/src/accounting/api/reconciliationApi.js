import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const authHeaders = (tenantId) => ({
  headers: { 
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'X-TenantID': tenantId || localStorage.getItem('tenantId') // Controller uses X-TenantID
  }
});

export const reconciliationApi = {
  getByBank:    (bankAccountId, tenantId) => axios.get(`${API_URL}/accounts/reconciliations/bank/${bankAccountId}`, authHeaders(tenantId)),
  getById:      (id, tenantId) => axios.get(`${API_URL}/accounts/reconciliations/${id}`, authHeaders(tenantId)),
  start:        (data, tenantId) => axios.post(`${API_URL}/accounts/reconciliations/start`, data, authHeaders(tenantId)),
  autoMatch:    (id, tenantId) => axios.post(`${API_URL}/accounts/reconciliations/${id}/auto-match`, {}, authHeaders(tenantId)),
  importMockLines: (id, tenantId) => axios.post(`${API_URL}/accounts/reconciliations/${id}/lines/import`, {}, authHeaders(tenantId)),
  resolve:      (lineId, journalEntryId, tenantId) => axios.post(`${API_URL}/accounts/reconciliations/lines/${lineId}/resolve?journalEntryId=${journalEntryId}`, {}, authHeaders(tenantId)),
  complete:     (id, tenantId) => axios.post(`${API_URL}/accounts/reconciliations/${id}/complete`, {}, authHeaders(tenantId)),
};
