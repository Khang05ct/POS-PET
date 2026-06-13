import axiosClient from './axiosClient';

const settingApi = {
  getSettings: () => axiosClient.get('/settings').then(res => res.data),
  updateSettings: (data) => axiosClient.put('/settings', data).then(res => res.data),
  updateStoreStatus: (status) => axiosClient.put('/settings/store-status', { store_status: status }).then(res => res.data),
};

export default settingApi;
