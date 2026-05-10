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

  createUser: async (data) => {
    const response = await api.post('/admin/users', data);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await api.patch(`/admin/users/${id}`, data);
    return response.data;
  },

  toggleUserStatus: async (id) => {
    const response = await api.post(`/admin/users/${id}/toggle-status`);
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

  updateInvoiceStatus: async (id, status) => {
    const response = await api.patch(`/billing/admin/invoices/${id}/status`, { status });
    return response.data;
  },

  refundInvoice: async (id, data) => {
    const response = await api.post(`/billing/admin/invoices/${id}/refund`, data);
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
  },

  // Services
  getAdminServices: async (params) => {
    const response = await api.get('/billing/admin/services', { params });
    return response.data;
  },

  updateServiceStatus: async (id, status, reason) => {
    const response = await api.patch(`/billing/admin/services/${id}/status`, { status, reason });
    return response.data;
  },

  // Servers
  getServers: async () => {
    const response = await api.get('/servers');
    return response.data;
  },

  createServer: async (data) => {
    const response = await api.post('/servers', data);
    return response.data;
  },

  getServerGroups: async () => {
    const response = await api.get('/servers/groups');
    return response.data;
  },

  createServerGroup: async (data) => {
    const response = await api.post('/servers/groups', data);
    return response.data;
  },

  // Domains
  getDomains: async (params) => {
    const response = await api.get('/domains', { params });
    return response.data;
  },

  getTldPricing: async () => {
    const response = await api.get('/domains/pricing');
    return response.data;
  },

  createTldPricing: async (data) => {
    const response = await api.post('/domains/pricing', data);
    return response.data;
  },

  updateTldPricing: async (id, data) => {
    const response = await api.patch(`/domains/pricing/${id}`, data);
    return response.data;
  },

  getRegistrars: async () => {
    const response = await api.get('/domains/registrars');
    return response.data;
  },

  createRegistrar: async (data) => {
    const response = await api.post('/domains/registrars', data);
    return response.data;
  },

  // Tax
  getTaxRules: async () => {
    const response = await api.get('/tax');
    return response.data;
  },

  createTaxRule: async (data) => {
    const response = await api.post('/tax', data);
    return response.data;
  },

  // Knowledgebase
  getKbCategories: async () => {
    const response = await api.get('/kb/categories');
    return response.data;
  },

  createKbCategory: async (data) => {
    const response = await api.post('/kb/categories', data);
    return response.data;
  },

  getKbArticles: async (params) => {
    const response = await api.get('/kb/articles', { params });
    return response.data;
  },

  createKbArticle: async (data) => {
    const response = await api.post('/kb/articles', data);
    return response.data;
  },
  
  getLogs: async (params) => {
    const response = await api.get('/admin/logs', { params });
    return response.data;
  }
};
