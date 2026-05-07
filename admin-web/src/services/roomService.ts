import api from '../api/axios';

export const roomService = {
  getRooms: async (params?: any) => {
    const response = await api.get('/rooms', { params });
    return response.data;
  },

  getRoomById: async (id: string) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  createRoom: async (data: any) => {
    const response = await api.post('/rooms', data);
    return response.data;
  },

  updateRoom: async (id: string, data: any) => {
    const response = await api.put(`/rooms/${id}`, data);
    return response.data;
  },

  deleteRoom: async (id: string) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },

  getSeatLayout: async (id: string) => {
    const response = await api.get(`/rooms/${id}/seat-layout`);
    return response.data;
  },

  updateSeatLayout: async (id: string, seatLayout: any) => {
    const response = await api.put(`/rooms/${id}/seat-layout`, { seatLayout });
    return response.data;
  },
};
