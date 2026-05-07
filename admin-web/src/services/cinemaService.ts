import api from '../api/axios';

export const cinemaService = {
  getCinemas: async (params?: any) => {
    const response = await api.get('/cinemas', { params });
    return response.data;
  },

  getCinemaById: async (id: string) => {
    const response = await api.get(`/cinemas/${id}`);
    return response.data;
  },

  createCinema: async (data: any) => {
    const response = await api.post('/cinemas', data);
    return response.data;
  },

  updateCinema: async (id: string, data: any) => {
    const response = await api.put(`/cinemas/${id}`, data);
    return response.data;
  },

  deleteCinema: async (id: string) => {
    const response = await api.delete(`/cinemas/${id}`);
    return response.data;
  },
};
