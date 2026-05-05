import api from './api';

export const adminService = {
  // Dashboard
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Clients
  getClients: async (params) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getClient: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
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
    const response = await api.get('/billing/admin/invoices', { params });
    return response.data;
  },

  createInvoice: async (data) => {
    const response = await api.post('/billing/admin/invoices', data);
    return response.data;
  },

  // Leads
  getLeads: async (params) => {
    const response = await api.get('/admin/leads', { params });
    return response.data;
  },

  updateLead: async (id, data) => {
    const response = await api.put(`/admin/leads/${id}`, data);
    return response.data;
  },

  // Products
  getProducts: async () => {
    const response = await api.get('/billing/products');
    return {
      data: {
        products: response.data
      }
    };
  },

  getProduct: async (id) => {
    const response = await api.get(`/billing/products/${id}`);
    return {
      data: {
        product: response.data
      }
    };
  },

  createProduct: async (data) => {
    const response = await api.post('/billing/products', data);
    return response.data;
  },

  updateProduct: async (id, data) => {
    const response = await api.put(`/billing/products/${id}`, data);
    return response.data;
  },

  // Orders
  getOrders: async (params) => {
    const response = await api.get('/billing/orders', { params });
    return response.data;
  },

  getOrder: async (id) => {
    const response = await api.get(`/billing/orders/${id}`);
    return response.data;
  }
};
