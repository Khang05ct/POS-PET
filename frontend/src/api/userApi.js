import axiosClient from './axiosClient';

const userApi = {
  getUsers: () => axiosClient.get('/users').then(res => res.data),
  createUser: (data) => axiosClient.post('/users', data).then(res => res.data),
  updateUser: (id, data) => axiosClient.put(`/users/${id}`, data).then(res => res.data),
  lockUser: (id, status) => axiosClient.put(`/users/${id}/lock`, { status }).then(res => res.data),
  deleteUser: (id) => axiosClient.delete(`/users/${id}`).then(res => res.data),
};

export default userApi;
