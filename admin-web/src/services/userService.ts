import api from '../api/axios';

export const userService = {
  getUsers: async (params?: any) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  changeRole: async (id: string, role: string) => {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  },

  changeStatus: async (id: string, status: string) => {
    const response = await api.patch(`/users/${id}/status`, { status });
    return response.data;
  },
};
