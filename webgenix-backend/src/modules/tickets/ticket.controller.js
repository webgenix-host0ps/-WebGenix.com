import { asyncHandler } from '../../utils/asyncHandler.js';
import * as ticketService from './ticket.service.js';
import * as ticketPermissions from './ticket.permissions.js';
import Department from './models/Department.js';
import { ApiError } from '../../utils/ApiError.js';
import { ROLES, STAFF_ROLES } from '../../constants/tickets.js';

export const getDepartments = asyncHandler(async (req, res) => {
    try {
        const departments = await Department.find({ isActive: true }).select('name email description');
        res.status(200).json({
            success: true,
            data: departments,
        });
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch departments',
        });
    }
});

export const createTicket = asyncHandler(async (req, res) => {
    try {
        if (!ticketPermissions.canCreateTicket(req.user)) {
            throw new ApiError(403, 'You do not have permission to create tickets');
        }

        // Input sanitization
        const { subject, description, departmentId, priority } = req.body;
        
        if (!subject || !description || !departmentId) {
            throw new ApiError(400, 'Subject, description, and department are required');
        }

        // Validate department exists
        const department = await Department.findById(departmentId);
        if (!department || !department.isActive) {
            throw new ApiError(404, 'Invalid department selected');
        }

        const ticket = await ticketService.createTicket(req.userId, req.body, req);

        res.status(201).json({
            success: true,
            data: ticket,
        });
    } catch (error) {
        console.error('Error creating ticket:', error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, 'Failed to create ticket');
    }
});

export const listTickets = asyncHandler(async (req, res) => {
    const filters = {
        status: req.query.status,
        priority: req.query.priority,
        department: req.query.department,
        client: req.query.client,
        search: req.query.search, // Support backend search
    };
    const pagination = {
        page: req.query.page,
        limit: req.query.limit,
    };

    const result = await ticketService.listTickets(filters, pagination, req.user);

    res.status(200).json({
        success: true,
        data: result.tickets,
        meta: {
            total: result.total,
            page: result.page,
            pages: result.pages,
        },
    });
});

export const getTicket = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { ticket, messages } = await ticketService.getTicketWithMessages(id, req.user);

    if (!ticketPermissions.canViewTicket(req.user, ticket)) {
        throw new ApiError(403, 'You do not have permission to view this ticket');
    }

    res.status(200).json({
        success: true,
        data: {
            ticket,
            messages,
        },
    });
});

export const addMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // P2: Efficient permission check (fetch only ticket, not all messages)
    const ticket = await ticketService.getTicketById(id);
    if (!ticketPermissions.canReply(req.user, ticket)) {
        throw new ApiError(403, 'You do not have permission to reply to this ticket');
    }

    const message = await ticketService.addMessage(id, req.userId, req.user.role, req.body, req);

    res.status(201).json({
        success: true,
        data: message,
    });
});

export const changeStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!ticketPermissions.canChangeStatus(req.user)) {
        throw new ApiError(403, 'You do not have permission to change ticket status');
    }

    const ticket = await ticketService.changeStatus(id, status, req.userId, req);

    res.status(200).json({
        success: true,
        data: ticket,
    });
});

export const assignTicket = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { assignedTo } = req.body;

    if (!ticketPermissions.canAssign(req.user)) {
        throw new ApiError(403, 'You do not have permission to assign tickets');
    }

    const ticket = await ticketService.assignTicket(id, assignedTo, req.userId, req);

    res.status(200).json({
        success: true,
        data: ticket,
    });
});

export const closeTicket = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // P2: Efficient permission check
    const ticket = await ticketService.getTicketById(id);
    if (!ticketPermissions.canCloseTicket(req.user, ticket)) {
        throw new ApiError(403, 'You do not have permission to close this ticket');
    }

    const closedTicket = await ticketService.closeTicket(id, req.userId, req);

    res.status(200).json({
        success: true,
        data: closedTicket,
    });
});

export const toggleWatcher = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    if (!STAFF_ROLES.includes(req.user.role)) {
        throw new ApiError(403, 'Only staff can watch tickets');
    }

    const ticket = await ticketService.toggleWatcher(id, req.userId);

    res.status(200).json({
        success: true,
        data: ticket,
    });
});

export const submitRating = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const ticket = await ticketService.submitRating(id, req.body, req.userId);

    res.status(200).json({
        success: true,
        data: ticket,
    });
});
