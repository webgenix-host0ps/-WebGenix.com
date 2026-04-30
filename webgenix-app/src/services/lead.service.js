import api from './api';

export const leadService = {
  getStats: async () => {
    return {
      data: {
        totalLeads: 45,
        newLeads: 12,
        contacted: 18,
        conversionRate: '24%'
      }
    };
  },

  getLeads: async (params) => {
    return {
      data: {
        leads: [
          { _id: 'l1', name: 'Startup Inc', email: 'ceo@startup.io', status: 'new', createdAt: '2024-04-22', assignedTo: 'me' },
          { _id: 'l2', name: 'Mega Corp', email: 'it@megacorp.com', status: 'negotiation', createdAt: '2024-04-10', assignedTo: 'me' }
        ]
      }
    };
  },

  updateLead: async (id, data) => {
    return { data: { success: true } };
  }
};
