import axiosClient from './axiosClient';

const inventoryApi = {
  getHistory: () => axiosClient.get('/inventory/history').then(res => res.data),
  importInventory: (data) => axiosClient.post('/inventory/import', data).then(res => res.data),
  adjustInventory: (data) => axiosClient.post('/inventory/adjust', data).then(res => res.data),
};

export default inventoryApi;
