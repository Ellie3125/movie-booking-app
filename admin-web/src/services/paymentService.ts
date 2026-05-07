import api from '../api/axios';

export const paymentService = {
  getPayments: async (params?: any) => {
    // Nếu project có get payments api. Tạm thời trả list rỗng nếu chưa có
    try {
      const response = await api.get('/payments', { params });
      return response.data;
    } catch (error) {
      return { data: { items: [], total: 0 } };
    }
  },
};
