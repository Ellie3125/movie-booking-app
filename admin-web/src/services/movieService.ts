import api from '../api/axios';

export const movieService = {
  getMovies: async (params?: any) => {
    const response = await api.get('/movies', { params });
    return response.data;
  },

  getMovieById: async (id: string) => {
    const response = await api.get(`/movies/${id}`);
    return response.data;
  },

  createMovie: async (data: any) => {
    const response = await api.post('/movies', data);
    return response.data;
  },

  updateMovie: async (id: string, data: any) => {
    const response = await api.put(`/movies/${id}`, data);
    return response.data;
  },

  deleteMovie: async (id: string) => {
    const response = await api.delete(`/movies/${id}`);
    return response.data;
  },
};
