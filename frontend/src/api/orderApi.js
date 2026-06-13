import axiosClient from './axiosClient';

const orderApi = {
  getOrders: () => axiosClient.get('/orders').then(res => res.data),
  getOrderById: (id) => axiosClient.get(`/orders/${id}`).then(res => res.data),
  checkout: (data) => axiosClient.post('/orders/checkout', data).then(res => res.data),
  createTemporary: (data) => axiosClient.post('/orders/temporary', data).then(res => res.data),
  cancelOrder: (id) => axiosClient.put(`/orders/${id}/cancel`).then(res => res.data),
};

export default orderApi;
