import User from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

// Dashboard Stats
export const getStats = asyncHandler(async (req, res) => {
    try {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        // Get real user counts
        const [totalClients, lastMonthClients, activeLeads, lastWeekLeads] = await Promise.all([
            User.countDocuments({ role: 'client' }),
            User.countDocuments({ role: 'client', createdAt: { $gte: lastMonth } }),
            User.countDocuments({ role: 'lead' }),
            User.countDocuments({ role: 'lead', createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } })
        ]);

        const stats = {
            totalClients,
            clientsTrend: lastMonthClients > 0 ? Math.round((lastMonthClients / totalClients) * 100) : 0,
            openTickets: 0, // Will be implemented when ticket model is ready
            ticketsTrend: 0,
            unpaidInvoices: 0, // Will be implemented when invoice model is ready
            invoicesTrend: 0,
            leads: activeLeads,
            leadsTrend: lastWeekLeads > 0 ? Math.round((lastWeekLeads / activeLeads) * 100) : 0
        };

        res.status(200).json(new ApiResponse(200, stats, 'Dashboard stats retrieved successfully'));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
});

// User Management
export const getUsers = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, search, role, status } = req.query;
        const skip = (page - 1) * limit;

        // Build query
        const query = {};
        if (role) query.role = role;
        if (status) query.isActive = status === 'active';
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json(new ApiResponse(200, {
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages
            }
        }, 'Users retrieved successfully'));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
});

export const getUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password');
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        const userData = {
            client: user,
            services: [], // Will be populated when service model is ready
            invoices: [], // Will be populated when invoice model is ready
            tickets: [] // Will be populated when ticket model is ready
        };

        res.status(200).json(new ApiResponse(200, userData, 'User details retrieved successfully'));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
});

export const updateUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const user = await User.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        res.status(200).json(new ApiResponse(200, user, 'User updated successfully'));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json(new ApiResponse(200, { 
            userId: id, 
            isActive: user.isActive 
        }, 'User status updated successfully'));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
});

// Lead Management
export const getLeads = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const skip = (page - 1) * limit;

        const query = { role: 'lead' };
        if (status) query.isActive = status === 'active';
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const [leads, total] = await Promise.all([
            User.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json(new ApiResponse(200, {
            leads,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages
            }
        }, 'Leads retrieved successfully'));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
});

export const createLead = asyncHandler(async (req, res) => {
    try {
        const leadData = req.body;
        
        const lead = new User({
            ...leadData,
            role: 'lead',
            isActive: true
        });

        await lead.save();

        res.status(201).json(new ApiResponse(201, lead, 'Lead created successfully'));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
});

export const updateLead = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const lead = await User.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!lead) {
            throw new ApiError(404, 'Lead not found');
        }

        res.status(200).json(new ApiResponse(200, lead, 'Lead updated successfully'));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
});

export const deleteLead = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const lead = await User.findByIdAndDelete(id);
        if (!lead) {
            throw new ApiError(404, 'Lead not found');
        }

        res.status(200).json(new ApiResponse(200, null, 'Lead deleted successfully'));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
});

// Analytics
export const getRevenueAnalytics = asyncHandler(async (req, res) => {
    try {
        res.status(200).json(new ApiResponse(200, [], 'Revenue analytics retrieved successfully'));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
});

export const getUserAnalytics = asyncHandler(async (req, res) => {
    try {
        const [totalUsers, newUsers, activeUsers] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }),
            User.countDocuments({ isActive: true })
        ]);

        res.status(200).json(new ApiResponse(200, {
            totalUsers,
            newUsers,
            activeUsers,
            userGrowth: []
        }, 'User analytics retrieved successfully'));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
});

export const getServiceAnalytics = asyncHandler(async (req, res) => {
    try {
        res.status(200).json(new ApiResponse(200, [], 'Service analytics retrieved successfully'));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
});
