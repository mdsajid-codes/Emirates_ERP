import axios from 'axios';

const BASE_URL = '/api/accounts/sub-ledger/fixed-assets';

export const fixedAssetSubLedgerApi = {
  getFixedAssetRegister: () => axios.get(BASE_URL),
  getAssetMovement: (fixedAssetId, params) => axios.get(`${BASE_URL}/${fixedAssetId}`, { params })
};
