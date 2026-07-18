import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const BASE_URL = `${API_URL}/accounts/sub-ledger`;

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const subLedgerApi = {
  // AR Endpoints
  getArSummary: () => axios.get(`${BASE_URL}/ar`, authHeaders()),
  getArStatement: (customerId, params) => axios.get(`${BASE_URL}/ar/${customerId}`, { ...authHeaders(), params }),
  getArAging: (params) => axios.get(`${BASE_URL}/ar/aging`, { ...authHeaders(), params }),

  // AP Endpoints
  getApSummary: () => axios.get(`${BASE_URL}/ap`, authHeaders()),
  getApStatement: (supplierId, params) => axios.get(`${BASE_URL}/ap/${supplierId}`, { ...authHeaders(), params }),
  getApAging: (params) => axios.get(`${BASE_URL}/ap/aging`, { ...authHeaders(), params }),

  // Employee Endpoints
  getEmployeeSummary: () => axios.get(`${BASE_URL}/employee`, authHeaders()),
  getEmployeeStatement: (employeeId, params) => axios.get(`${BASE_URL}/employee/${employeeId}`, { ...authHeaders(), params }),

  // Bank Endpoints
  getBankSummary: () => axios.get(`${BASE_URL}/bank`, authHeaders()),
  getBankStatement: (bankAccountId, params) => axios.get(`${BASE_URL}/bank/${bankAccountId}`, { ...authHeaders(), params }),

  // Inventory Endpoints
  getInventorySummary: () => axios.get(`${BASE_URL}/inventory`, authHeaders()),
  getInventoryMovement: (itemId, params) => axios.get(`${BASE_URL}/inventory/${itemId}`, { ...authHeaders(), params }),

  // Fixed Asset Endpoints
  getFixedAssetSummary: () => axios.get(`${BASE_URL}/assets`, authHeaders()),
  getFixedAssetMovement: (assetId, params) => axios.get(`${BASE_URL}/assets/${assetId}`, { ...authHeaders(), params }),

  // Reconciliation Dashboard Endpoints
  getReconciliationDashboard: (params) => axios.get(`${BASE_URL}/reconciliation`, { ...authHeaders(), params })
};
