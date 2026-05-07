import api from '../api/axios';

export const metaService = {
  getCinemaOptions: async () => {
    const response = await api.get('/meta/cinema-options');
    return response.data;
  },
  getMovieOptions: async () => {
    const response = await api.get('/meta/movie-options');
    return response.data;
  },
  getProvinces: async () => {
    const response = await api.get('/meta/cinema-options');
    // The current backend returns { brands, provinces } in data
    return { data: response.data.data.provinces };
  },
  getGenres: async () => {
    const response = await api.get('/meta/movie-options');
    return { data: response.data.data.genres };
  },
};
