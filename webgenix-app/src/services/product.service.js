import api from './api';

export const productService = {
    getAll: async (params) => {
        const response = await api.get('/billing/products', { params });
        return response.data;
    },
    getBySlug: async (slug) => {
        const response = await api.get(`/billing/products/slug/${slug}`);
        return response.data;
    },
};
