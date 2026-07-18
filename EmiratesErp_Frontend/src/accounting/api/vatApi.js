import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api') + '/accounts/vat';

const authHeaders = (tenantId = 'neon10') => ({
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'X-Tenant-ID': tenantId
  }
});

export const vatApi = {
    // VAT Groups
    getGroups: () => axios.get(`${API_BASE}/groups`, authHeaders()),
    createGroup: (data) => axios.post(`${API_BASE}/groups`, data, authHeaders()),
    updateGroup: (id, data) => axios.put(`${API_BASE}/groups/${id}`, data, authHeaders()),
    deleteGroup: (id) => axios.delete(`${API_BASE}/groups/${id}`, authHeaders()),

    // VAT Types
    getTypes: () => axios.get(`${API_BASE}/types`, authHeaders()),
    createType: (data) => axios.post(`${API_BASE}/types`, data, authHeaders()),
    updateType: (id, data) => axios.put(`${API_BASE}/types/${id}`, data, authHeaders()),
    deleteType: (id) => axios.delete(`${API_BASE}/types/${id}`, authHeaders()),

    // VAT Rates
    getRates: () => axios.get(`${API_BASE}/rates`, authHeaders()),
    createRate: (data) => axios.post(`${API_BASE}/rates`, data, authHeaders()),
    updateRate: (id, data) => axios.put(`${API_BASE}/rates/${id}`, data, authHeaders()),
    deleteRate: (id) => axios.delete(`${API_BASE}/rates/${id}`, authHeaders()),

    // Tax Transactions
    getTaxTransactions: () => axios.get(`${API_BASE}/transactions`, authHeaders()),
    createTaxTransaction: (data) => axios.post(`${API_BASE}/transactions`, data, authHeaders()),

    // Reports & Settlements
    getLiability: (fromDate, toDate) => axios.get(`${API_BASE}/liability`, { ...authHeaders(), params: { fromDate, toDate } }),
    getReturn: (fromDate, toDate) => axios.get(`${API_BASE}/return`, { ...authHeaders(), params: { fromDate, toDate } }),
    settleLiability: (data) => axios.post(`${API_BASE}/settle`, data, authHeaders()),
    getOutputReport: (fromDate, toDate) => axios.get(`${API_BASE}/output-report`, { ...authHeaders(), params: { fromDate, toDate } }),
    getInputReport: (fromDate, toDate) => axios.get(`${API_BASE}/input-report`, { ...authHeaders(), params: { fromDate, toDate } })
};
