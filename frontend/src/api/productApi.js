import axiosClient from './axiosClient';

const productApi = {
  getProducts: () => axiosClient.get('/products').then(res => res.data),
  searchProducts: (keyword) => axiosClient.get(`/products/search?keyword=${keyword}`).then(res => res.data),
  getProductByBarcode: (barcode) => axiosClient.get(`/products/barcode/${barcode}`).then(res => res.data),
  createProduct: (data) => axiosClient.post('/products', data).then(res => res.data),
  updateProduct: (id, data) => axiosClient.put(`/products/${id}`, data).then(res => res.data),
  deleteProduct: (id) => axiosClient.delete(`/products/${id}`).then(res => res.data),
};

export default productApi;
