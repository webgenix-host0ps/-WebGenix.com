import api from './api';

export const adminService = {
  // Dashboard
  getStats: async () => {
    // return api.get('/admin/stats');
    // MOCK
    return {
      data: {
        totalClients: 1250,
        clientsTrend: 12,
        openTickets: 45,
        ticketsTrend: -5,
        unpaidInvoices: 28,
        invoicesTrend: 8,
        leads: 120,
        leadsTrend: 15
      }
    };
  },

  // Clients
  getClients: async (params) => {
    // return api.get('/admin/clients', { params });
    return {
      data: {
        clients: [
          { _id: 'c1', name: 'Acme Corp', email: 'contact@acme.com', status: 'active', role: 'client', joinedAt: '2023-01-15' },
          { _id: 'c2', name: 'Global Tech', email: 'info@globaltech.com', status: 'active', role: 'client', joinedAt: '2023-03-22' },
        ],
        totalPages: 1
      }
    };
  },
  
  // Tickets
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
    // Backend uses separate PATCH for status
    if (data.status) {
      await api.patch(`/tickets/${id}/status`, { status: data.status.toUpperCase() });
    }
    // Note: backend doesn't have a specific priority update endpoint yet, 
    // but the controller handles it if we add it. For now, we focus on status.
    return { data: { success: true } };
  },

  replyTicket: async (id, data) => {
    const response = await api.post(`/tickets/${id}/messages`, data);
    return response.data;
  },

  // Invoices
  getInvoices: async (params) => {
    // return api.get('/admin/invoices', { params });
    return {
      data: {
        invoices: [
          { _id: 'INV-1001', client: { name: 'Acme Corp' }, amount: 250.00, status: 'unpaid', dueDate: '2024-05-01' },
          { _id: 'INV-1002', client: { name: 'Global Tech' }, amount: 1500.00, status: 'paid', dueDate: '2024-04-15' }
        ],
        totalPages: 1
      }
    };
  },

  createInvoice: async (data) => {
    // return api.post('/admin/invoices', data);
    return { data: { success: true } };
  },

  // Leads
  getLeads: async (params) => {
    // return api.get('/admin/leads', { params });
    return {
      data: {
        leads: [
          { _id: 'l1', name: 'Startup Inc', email: 'ceo@startup.io', status: 'new', createdAt: '2024-04-22' },
          { _id: 'l2', name: 'Mega Corp', email: 'it@megacorp.com', status: 'negotiation', createdAt: '2024-04-10' }
        ],
        totalPages: 1
      }
    };
  },

  updateLead: async (id, data) => {
    // return api.put(`/admin/leads/${id}`, data);
    return { data: { success: true } };
  }
};
