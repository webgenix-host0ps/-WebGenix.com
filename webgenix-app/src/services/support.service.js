import api from './api';

export const supportService = {
  getStats: async () => {
    return {
      data: {
        openTickets: 15,
        myTickets: 5,
        avgResponseTime: '2.5 hrs',
        resolvedToday: 8
      }
    };
  },
  
  getTickets: async (params) => {
    // Clean empty string params
    const cleanParams = Object.fromEntries(
        Object.entries(params || {}).filter(([_, v]) => v !== '')
    );
    const response = await api.get('/tickets', { params: cleanParams });
    return {
      data: {
        tickets: response.data.data,
        totalPages: response.data.meta?.pages || 1
      }
    };
  },

  getTicket: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  updateTicket: async (id, data) => {
    if (data.status) {
      await api.patch(`/tickets/${id}/status`, { status: data.status.toUpperCase() });
    }
    return { data: { success: true } };
  },

  replyTicket: async (id, data) => {
    const response = await api.post(`/tickets/${id}/messages`, data);
    return response.data;
  }
};
