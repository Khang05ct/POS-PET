import axiosClient from './axiosClient';

const categoryApi = {
  getCategories: () => axiosClient.get('/categories').then(res => res.data),
  createCategory: (data) => axiosClient.post('/categories', data).then(res => res.data),
  updateCategory: (id, data) => axiosClient.put(`/categories/${id}`, data).then(res => res.data),
  deleteCategory: (id) => axiosClient.delete(`/categories/${id}`).then(res => res.data),
};

export default categoryApi;
