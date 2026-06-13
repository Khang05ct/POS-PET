import axiosClient from './axiosClient';

const reportApi = {
  getDashboard: () => axiosClient.get('/reports/dashboard').then(res => res.data),
  getBestSelling: () => axiosClient.get('/reports/best-selling').then(res => res.data),
  getPaymentMethods: () => axiosClient.get('/reports/payment-methods').then(res => res.data),
};

export default reportApi;
