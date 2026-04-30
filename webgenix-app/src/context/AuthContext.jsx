import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state from storage and validate token
    useEffect(() => {
        const initAuth = async () => {
            const storedUser = authService.getStoredUser();
            const hasToken = authService.isAuthenticated();

            if (hasToken && storedUser) {
                try {
                    // Validate token by fetching current user
                    const response = await authService.getCurrentUser();
                    const { user: currentUser } = response.data;
                    setUser(currentUser);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Token validation failed:', error);
                    // Token invalid, clear storage
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    // Login
    const login = useCallback(async (credentials) => {
        const response = await authService.login(credentials);
        const { user: loggedInUser } = response.data;
        setUser(loggedInUser);
        setIsAuthenticated(true);
        return response;
    }, []);

    // Register
    const register = useCallback(async (userData) => {
        const response = await authService.register(userData);
        return response;
    }, []);

    // Logout
    const logout = useCallback(async () => {
        await authService.logout();
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    // Update user data
    const updateUser = useCallback((updates) => {
        setUser((prev) => {
            const updated = { ...prev, ...updates };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    }, []);

    // Refresh user data from server
    const refreshUser = useCallback(async () => {
        try {
            const response = await authService.getCurrentUser();
            const { user: currentUser } = response.data;
            setUser(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));
            return currentUser;
        } catch (error) {
            // If refresh fails, logout
            await logout();
            throw error;
        }
    }, [logout]);

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
