import api from '../api/axios';

export const bookingService = {
  getBookings: async (params?: any) => {
    const response = await api.get('/bookings/admin/all', { params });
    return response.data;
  },

  getBookingById: async (id: string) => {
    const response = await api.get(`/bookings/admin/${id}`);
    return response.data;
  },

  cancelBooking: async (id: string) => {
    const response = await api.post(`/bookings/admin/${id}/cancel`);
    return response.data;
  },
};
