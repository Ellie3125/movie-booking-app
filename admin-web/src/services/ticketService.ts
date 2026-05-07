import api from '../api/axios';

export const ticketService = {
  getTickets: async (params?: any) => {
    const response = await api.get('/tickets/admin/all', { params });
    return response.data;
  },

  getTicketById: async (id: string) => {
    const response = await api.get(`/tickets/admin/${id}`);
    return response.data;
  },

  markTicketAsUsed: async (id: string) => {
    const response = await api.post(`/tickets/admin/${id}/use`);
    return response.data;
  },
};
