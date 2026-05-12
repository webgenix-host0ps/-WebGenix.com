import api from './api';

export const leadService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getLeads: async (params) => {
    const response = await api.get('/admin/leads', { params });
    return response.data;
  },

  updateLead: async (id, data) => {
    const response = await api.put(`/admin/leads/${id}`, data);
    return response.data;
  }
};
