import User from '../../models/User.js';
import Ticket from '../tickets/models/Ticket.js';
import Invoice from '../billing/models/Invoice.js';
import Service from '../billing/models/Service.js';
import Order from '../billing/models/Order.js';
import SystemSetting from './models/SystemSetting.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';



export const getSystemSettings = asyncHandler(async (req, res) => {
    const settings = await SystemSetting.find().sort({ group: 1, key: 1 });
    res.status(200).json(new ApiResponse(200, settings, 'System settings retrieved successfully'));
});

export const updateSystemSettings = asyncHandler(async (req, res) => {
    const { settings } = req.body; // Array of { key, value }
    
    if (!Array.isArray(settings)) {
        throw new ApiError(400, 'Settings must be an array');
    }

    const updatedSettings = [];
    for (const item of settings) {
        const setting = await SystemSetting.findOneAndUpdate(
            { key: item.key },
            { $set: { value: item.value, updatedBy: req.user._id } },
            { new: true, upsert: true }
        );
        updatedSettings.push(setting);
    }

    res.status(200).json(new ApiResponse(200, updatedSettings, 'System settings updated successfully'));
});

// Dashboard Stats
export const getStats = asyncHandler(async (req, res) => {
    try {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        // Get real user counts and other stats
        const [totalClients, lastMonthClients, activeLeads, lastWeekLeads, openTickets, unpaidInvoices, activeServices] = await Promise.all([
            User.countDocuments({ role: 'client' }),
            User.countDocuments({ role: 'client', createdAt: { $gte: lastMonth } }),
            User.countDocuments({ role: 'lead' }),
            User.countDocuments({ role: 'lead', createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }),
            Ticket.countDocuments({ status: { $in: ['OPEN', 'CLIENT_REPLY', 'IN_PROGRESS'] }, isClosed: false }),
            Invoice.countDocuments({ status: 'unpaid' }),
            Service.countDocuments({ status: 'active' })
        ]);

        const stats = {
            totalClients,
            clientsTrend: lastMonthClients > 0 ? Math.round((lastMonthClients / totalClients) * 100) : 0,
            openTickets,
            ticketsTrend: 0, // Placeholder for trend
            unpaidInvoices,
            invoicesTrend: 0, // Placeholder for trend
            leads: activeLeads,
            leadsTrend: lastWeekLeads > 0 ? Math.round((lastWeekLeads / activeLeads) * 100) : 0,
            activeServices,
        };

        res.status(200).json(new ApiResponse(200, stats, 'Dashboard stats retrieved successfully'));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
});

// User Management
export const getUsers = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 100, search, role, status } = req.query;
        const skip = (page - 1) * limit;

        console.log('[AdminController] getUsers called with params:', { page, limit, search, role, status });

        // Build query - by default show ALL users (clients, admin, staff)
        const query = {};
        
        // Only filter by role if explicitly provided and not 'all'
        if (role && role !== 'all') {
            query.role = role;
        }
        
        // Status filter
        if (status && status !== 'all') {
            query.isActive = status === 'active';
        }
        
        // Search filter (name or email)
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        console.log('[AdminController] MongoDB query:', JSON.stringify(query));

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query)
        ]);

        console.log(`[AdminController] Found ${users.length} users out of ${total} total`);

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
        console.error('[AdminController] Error in getUsers:', error);
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

        const [services, invoices, tickets, orders] = await Promise.all([
            Service.find({ userId: id }).sort({ createdAt: -1 }),
            Invoice.find({ userId: id }).sort({ dateIssued: -1 }),
            Ticket.find({ client: id }).sort({ createdAt: -1 }),
            Order.find({ userId: id }).sort({ createdAt: -1 }),
        ]);

        const userData = {
            client: user,
            services,
            invoices,
            tickets,
            orders,
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

export const createUser = asyncHandler(async (req, res) => {
    try {
        const { email, password, name, role, phone } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new ApiError(400, 'User with this email already exists');
        }
        
        const user = new User({
            email,
            password,
            name,
            role: role || 'client',
            phone,
            isActive: true,
            emailVerified: true // Admin created accounts are verified by default
        });
        
        await user.save();
        
        // Remove password from response
        const userObj = user.toObject();
        delete userObj.password;
        
        res.status(201).json(new ApiResponse(201, userObj, 'User created successfully'));
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
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const monthlyRevenue = await Invoice.aggregate([
            { 
                $match: { 
                    status: 'paid', 
                    datePaid: { $gte: startOfMonth } 
                } 
            },
            { 
                $group: { 
                    _id: null, 
                    total: { $sum: '$total' } 
                } 
            }
        ]);

        const totalRevenue = monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0;

        res.status(200).json(new ApiResponse(200, {
            currentMonthTotal: totalRevenue,
            chartData: [] // TODO: Implement 12-month historical data when needed
        }, 'Revenue analytics retrieved successfully'));
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
        const [activeCount, suspendedCount, cancelledCount, byType] = await Promise.all([
            Service.countDocuments({ status: 'active' }),
            Service.countDocuments({ status: 'suspended' }),
            Service.countDocuments({ status: 'cancelled' }),
            Service.aggregate([
                { $group: { _id: '$productType', count: { $sum: 1 } } }
            ])
        ]);

        res.status(200).json(new ApiResponse(200, {
            total: activeCount + suspendedCount + cancelledCount,
            active: activeCount,
            suspended: suspendedCount,
            cancelled: cancelledCount,
            byType
        }, 'Service analytics retrieved successfully'));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
});

export const getLogs = asyncHandler(async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const AuditLog = (await import('../../models/AuditLog.js')).default;
        
        const logs = await AuditLog.find()
            .populate('userId', 'name email role')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));
            
        res.status(200).json(new ApiResponse(200, logs, 'Audit logs retrieved successfully'));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, error.message));
    }
});
