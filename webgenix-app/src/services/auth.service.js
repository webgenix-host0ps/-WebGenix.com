import api from './api.js';

export const authService = {
    // Register new user
    async register(userData) {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    // Login user
    async login(credentials) {
        const response = await api.post('/auth/login', credentials);
        const { user, accessToken } = response.data.data;

        // Store auth data
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));

        return response.data;
    },

    // Logout user
    async logout() {
        try {
            await api.post('/auth/logout');
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
        }
    },

    // Get current user
    async getCurrentUser() {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // Refresh access token
    async refreshToken() {
        const response = await api.post('/auth/refresh');
        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        return response.data;
    },

    // Forgot password
    async forgotPassword(email) {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    // Reset password
    async resetPassword(token, newPassword) {
        const response = await api.post('/auth/reset-password', {
            token,
            newPassword,
        });
        return response.data;
    },

    // Verify email
    async verifyEmail(token) {
        const response = await api.get('/auth/verify-email', {
            params: { token },
        });
        return response.data;
    },

    // Check if user is authenticated
    isAuthenticated() {
        return !!localStorage.getItem('accessToken');
    },

    // Get stored user
    getStoredUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
};
