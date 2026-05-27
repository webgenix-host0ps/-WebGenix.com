import api from './api';

export const homepageService = {
    getProducts: async () => {
        const response = await api.get('/billing/products/homepage');
        return response.data;
    },
};
