import api from './api';

export const getSystemSettings = async () => {
    const response = await api.get('/admin/settings');
    return response.data;
};

export const updateSystemSettings = async (settings) => {
    const response = await api.patch('/admin/settings', { settings });
    return response.data;
};
