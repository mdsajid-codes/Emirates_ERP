import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_PATH = '/accounts/sub-ledger/reconciliation-summary';

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const reconApi = {
    getReconciliationSummary: () => {
        return axios.get(`${API_URL}${BASE_PATH}`, authHeaders());
    },
    getUntaggedLines: (subLedgerKey) => {
        return axios.get(`${API_URL}${BASE_PATH}/${subLedgerKey}`, authHeaders());
    }
};
