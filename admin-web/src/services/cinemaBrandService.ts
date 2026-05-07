import api from '../api/axios';

export const cinemaBrandService = {
  getBrands: async (params?: any) => {
    const response = await api.get('/cinema-brands', { params });
    return response.data;
  },

  getBrandById: async (id: string) => {
    const response = await api.get(`/cinema-brands/${id}`);
    return response.data;
  },

  createBrand: async (data: any) => {
    const response = await api.post('/cinema-brands', data);
    return response.data;
  },

  updateBrand: async (id: string, data: any) => {
    const response = await api.put(`/cinema-brands/${id}`, data);
    return response.data;
  },

  deleteBrand: async (id: string) => {
    const response = await api.delete(`/cinema-brands/${id}`);
    return response.data;
  },
};
