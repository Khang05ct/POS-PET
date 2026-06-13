import axiosClient from './axiosClient';

const customerApi = {
  getCustomers: () => axiosClient.get('/customers').then(res => res.data),
  searchCustomers: (keyword) => axiosClient.get(`/customers/search?keyword=${keyword}`).then(res => res.data),
  createCustomer: (data) => axiosClient.post('/customers', data).then(res => res.data),
};

export default customerApi;
