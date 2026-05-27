import api from './api';

export const svcService = {
    list: async (params) => {
        const response = await api.get('/services', { params });
        return response.data;
    },
    getWebDevServices: async () => {
        const response = await api.get('/services', { params: { type: 'web-development' } });
        return response.data;
    },
    getBySlug: async (slug) => {
        const response = await api.get(`/services/slug/${slug}`);
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/services/${id}`);
        return response.data;
    },
};
