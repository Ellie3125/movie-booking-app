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
};
