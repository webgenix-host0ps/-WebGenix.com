import api from './api';

export const billingService = {
    // Products
    getProducts: async (params) => {
        const response = await api.get('/billing/products', { params });
        return response.data;
    },
    
    getProduct: async (id) => {
        const response = await api.get(`/billing/products/${id}`);
        return response.data;
    },
    
    getProductBySlug: async (slug) => {
        const response = await api.get(`/billing/products/slug/${slug}`);
        return response.data;
    },
    
    getFeaturedProducts: async () => {
        const response = await api.get('/billing/products/featured');
        return response.data;
    },
    
    // Client Services (My Services)
    getMyServices: async (params) => {
        const response = await api.get('/billing/services', { params });
        return response.data;
    },
    
    // Admin Services
    getAdminServices: async (params) => {
        const response = await api.get('/billing/admin/services', { params });
        return response.data;
    },
    
    // Orders
    createOrder: async (orderData) => {
        const response = await api.post('/billing/orders', orderData);
        return response.data;
    },
    
    getOrders: async (params) => {
        const response = await api.get('/billing/orders', { params });
        return response.data;
    },
    
    getOrder: async (id) => {
        const response = await api.get(`/billing/orders/${id}`);
        return response.data;
    },
    
    cancelOrder: async (id, reason) => {
        const response = await api.post(`/billing/orders/${id}/cancel`, { reason });
        return response.data;
    },
    
    // Invoices
    getInvoices: async (params) => {
        const response = await api.get('/billing/invoices', { params });
        return response.data;
    },
    
    getInvoice: async (id) => {
        const response = await api.get(`/billing/invoices/${id}`);
        return response.data;
    },
    
    getAllInvoices: async (params) => {
        const response = await api.get('/billing/admin/invoices', { params });
        return response.data;
    },
    
    // Payments
    createRazorpayOrder: async (invoiceId) => {
        const response = await api.post('/billing/payments/razorpay/create-order', { invoiceId });
        return response.data;
    },
    
    verifyRazorpayPayment: async (data) => {
        const response = await api.post('/billing/payments/razorpay/verify', data);
        return response.data;
    },
    
    getPaymentHistory: async (params) => {
        const response = await api.get('/billing/payments', { params });
        return response.data;
    },
    
    // Promo Codes
    validatePromoCode: async (code) => {
        const response = await api.post('/billing/promocode/validate', { code });
        return response.data;
    },
    
    // Admin - Products
    createProduct: async (data) => {
        const response = await api.post('/billing/products', data);
        return response.data;
    },
    
    updateProduct: async (id, data) => {
        const response = await api.patch(`/billing/products/${id}`, data);
        return response.data;
    },
    
    deleteProduct: async (id) => {
        const response = await api.delete(`/billing/products/${id}`);
        return response.data;
    },
    
    toggleProductStatus: async (id) => {
        const response = await api.post(`/billing/products/${id}/toggle`);
        return response.data;
    },
    
    // Admin - Promo Codes
    getPromoCodes: async () => {
        const response = await api.get('/billing/promocode');
        return response.data;
    },
    
    createPromoCode: async (data) => {
        const response = await api.post('/billing/promocode', data);
        return response.data;
    },
    
    updatePromoCode: async (id, data) => {
        const response = await api.patch(`/billing/promocode/${id}`, data);
        return response.data;
    },
    
    deletePromoCode: async (id) => {
        const response = await api.delete(`/billing/promocode/${id}`);
        return response.data;
    },
};