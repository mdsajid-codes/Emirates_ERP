import axios from 'axios';

const BASE_URL = '/api/accounts/sub-ledger/inventory';

export const inventorySubLedgerApi = {
  getInventorySummary: () => axios.get(BASE_URL),
  getInventoryMovement: (itemId, params) => axios.get(`${BASE_URL}/${itemId}`, { params }),
  getStockValuation: () => axios.get(`${BASE_URL}/valuation`)
};
