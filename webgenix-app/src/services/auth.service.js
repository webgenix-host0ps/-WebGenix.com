import api from './api.js';

// Simple cache for user data
let userCache = null;
let userCacheTime = null;
const CACHE_DURATION = 60000; // 1 minute

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
        
        // Clear cache to get fresh data
        userCache = null;
        userCacheTime = null;

        return response.data;
    },

    // Logout user
    async logout() {
        try {
            await api.post('/auth/logout');
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            // Clear cache
            userCache = null;
            userCacheTime = null;
        }
    },

    // Get current user with caching
    async getCurrentUser() {
        // Return cached data if still valid
        if (userCache && userCacheTime && (Date.now() - userCacheTime) < CACHE_DURATION) {
            return userCache;
        }
        
        const response = await api.get('/auth/me');
        
        // Cache the response
        userCache = response.data;
        userCacheTime = Date.now();
        
        return response.data;
    },
    
    // Clear user cache (call after login/logout/update)
    clearUserCache() {
        userCache = null;
        userCacheTime = null;
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

    // Update user profile
    async updateProfile(profileData) {
        const response = await api.patch('/auth/profile', profileData);
        // Update stored user data
        if (response.data?.data?.user) {
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        // Clear cache to get fresh data
        userCache = null;
        userCacheTime = null;
        return response.data;
    },

    // 2FA Setup
    async setup2FA() {
        const response = await api.post('/auth/2fa/setup');
        return response.data;
    },

    // 2FA Verify
    async verify2FA(token) {
        const response = await api.post('/auth/2fa/verify', { token });
        if (response.data?.data?.user) {
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        userCache = null;
        return response.data;
    },

    // 2FA Disable
    async disable2FA() {
        const response = await api.post('/auth/2fa/disable');
        if (response.data?.data?.user) {
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        userCache = null;
        return response.data;
    },
};
