import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const reportsApi = {
  getTrialBalance: (params) => 
    axios.get(`${API_URL}/accounts/reports/trial-balance`, { ...authHeaders(), params }),
  
  getIncomeStatement: (params) => 
    axios.get(`${API_URL}/accounts/reports/income-statement`, { ...authHeaders(), params }),
  
  getBalanceSheet: (params) => 
    axios.get(`${API_URL}/accounts/reports/balance-sheet`, { ...authHeaders(), params }),
  
  getGeneralLedger: (accountId, params) => 
    axios.get(`${API_URL}/accounts/reports/general-ledger/${accountId}`, { ...authHeaders(), params }),

  // File Downloads
  downloadTrialBalanceExcel: (params) => 
    axios.get(`${API_URL}/accounts/reports/trial-balance/export/excel`, { ...authHeaders(), params, responseType: 'blob' }),
  
  downloadTrialBalancePdf: (params) => 
    axios.get(`${API_URL}/accounts/reports/trial-balance/export/pdf`, { ...authHeaders(), params, responseType: 'blob' }),
  
  downloadIncomeStatementExcel: (params) => 
    axios.get(`${API_URL}/accounts/reports/income-statement/export/excel`, { ...authHeaders(), params, responseType: 'blob' }),
  
  downloadIncomeStatementPdf: (params) => 
    axios.get(`${API_URL}/accounts/reports/income-statement/export/pdf`, { ...authHeaders(), params, responseType: 'blob' }),
  
  downloadBalanceSheetExcel: (params) => 
    axios.get(`${API_URL}/accounts/reports/balance-sheet/export/excel`, { ...authHeaders(), params, responseType: 'blob' }),
  
  downloadBalanceSheetPdf: (params) => 
    axios.get(`${API_URL}/accounts/reports/balance-sheet/export/pdf`, { ...authHeaders(), params, responseType: 'blob' }),
};
