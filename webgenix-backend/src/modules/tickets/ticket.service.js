import Ticket from './models/Ticket.js';
import TicketMessage from './models/TicketMessage.js';
import TicketActivity from './models/TicketActivity.js';
import Department from './models/Department.js';
import User from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';
import { logAction } from '../../services/audit.service.js';
import { TICKET_STATUS, ROLES } from '../../constants/tickets.js';

export const createTicket = async (clientId, ticketData, req) => {
    const { subject, description, departmentId, priority } = ticketData;

    // Ensure department exists
    const department = await Department.findById(departmentId);
    if (!department) {
        throw new ApiError(404, 'Department not found');
    }

    const ticket = await Ticket.create({
        subject,
        description,
        department: departmentId,
        priority,
        client: clientId,
    });

    // Create initial message
    await TicketMessage.create({
        ticket: ticket._id,
        sender: clientId,
        senderRole: ROLES.CLIENT,
        message: description,
        attachments: ticketData.attachments || [],
    });

    await TicketActivity.create({
        ticket: ticket._id,
        action: 'CREATED',
        performedBy: clientId,
    });

    await logAction({
        userId: clientId,
        action: 'TICKET_CREATED',
        metadata: { ticketId: ticket._id },
        req,
    });

    return ticket;
};

export const addMessage = async (ticketId, senderId, senderRole, messageData, req) => {
    const { message, attachments, isInternal } = messageData;
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
        throw new ApiError(404, 'Ticket not found');
    }

    if (ticket.isClosed && senderRole === ROLES.CLIENT) {
        throw new ApiError(400, 'Cannot reply to a closed ticket');
    }

    // Only staff can set isInternal
    const internal = [ROLES.SUPPORT, ROLES.ADMIN, ROLES.LEAD].includes(senderRole) ? (isInternal || false) : false;

    const ticketMessage = await TicketMessage.create({
        ticket: ticketId,
        sender: senderId,
        senderRole: senderRole.toLowerCase(),
        message,
        attachments,
        isInternal: internal,
    });

    // Update ticket's lastReplyBy and lastReplyAt
    const isStaff = senderRole !== ROLES.CLIENT;
    ticket.lastReplyBy = isStaff ? 'STAFF' : 'CLIENT';
    ticket.lastReplyAt = new Date();

    if (isStaff) {
        if (ticket.status === TICKET_STATUS.OPEN || ticket.status === TICKET_STATUS.CLIENT_REPLY) {
            ticket.status = TICKET_STATUS.ANSWERED;
        }
    } else if (ticket.status !== TICKET_STATUS.OPEN) {
        ticket.status = TICKET_STATUS.CLIENT_REPLY;
    }

    await ticket.save();

    await TicketActivity.create({
        ticket: ticket._id,
        action: 'REPLIED',
        performedBy: senderId,
    });

    await logAction({
        userId: senderId,
        action: 'TICKET_REPLIED',
        metadata: { ticketId: ticket._id },
        req,
    });

    return ticketMessage;
};

export const changeStatus = async (ticketId, newStatus, userId, req) => {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
        throw new ApiError(404, 'Ticket not found');
    }

    if (ticket.status === newStatus) {
        return ticket;
    }

    const oldStatus = ticket.status;
    ticket.status = newStatus;

    if (newStatus === TICKET_STATUS.CLOSED) {
        ticket.isClosed = true;
        ticket.closedAt = new Date();
    } else if (ticket.isClosed) {
        // Reopening
        ticket.isClosed = false;
        ticket.closedAt = null;
    }

    await ticket.save();

    let action = 'STATUS_CHANGED';
    if (newStatus === TICKET_STATUS.CLOSED) action = 'CLOSED';
    else if (oldStatus === TICKET_STATUS.CLOSED && newStatus !== TICKET_STATUS.CLOSED) action = 'REOPENED';

    await TicketActivity.create({
        ticket: ticket._id,
        action,
        performedBy: userId,
        oldValue: oldStatus,
        newValue: newStatus,
    });

    await logAction({
        userId,
        action: `TICKET_${action}`,
        metadata: { ticketId: ticket._id, oldStatus, newStatus },
        req,
    });

    return ticket;
};

export const assignTicket = async (ticketId, assigneeId, assignedBy, req) => {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
        throw new ApiError(404, 'Ticket not found');
    }

    // Ensure assignee exists and is staff
    const assignee = await User.findById(assigneeId);
    if (!assignee) {
        throw new ApiError(404, 'Assignee not found');
    }
    
    if (assignee.role === ROLES.CLIENT) {
        throw new ApiError(400, 'Cannot assign ticket to a client');
    }

    const oldAssignee = ticket.assignedTo;
    ticket.assignedTo = assigneeId;
    await ticket.save();

    await TicketActivity.create({
        ticket: ticket._id,
        action: 'ASSIGNED',
        performedBy: assignedBy,
        oldValue: oldAssignee,
        newValue: assigneeId,
    });

    await logAction({
        userId: assignedBy,
        action: 'TICKET_ASSIGNED',
        metadata: { ticketId: ticket._id, assigneeId },
        req,
    });

    return ticket;
};

export const closeTicket = async (ticketId, userId, req) => {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
        throw new ApiError(404, 'Ticket not found');
    }

    if (ticket.isClosed) {
        throw new ApiError(400, 'Ticket is already closed');
    }

    ticket.isClosed = true;
    ticket.closedAt = new Date();
    ticket.status = TICKET_STATUS.CLOSED;
    await ticket.save();

    await TicketActivity.create({
        ticket: ticket._id,
        action: 'CLOSED',
        performedBy: userId,
    });

    await logAction({
        userId,
        action: 'TICKET_CLOSED',
        metadata: { ticketId: ticket._id },
        req,
    });

    return ticket;
};

export const toggleWatcher = async (ticketId, userId) => {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found');

    const index = ticket.watchers.findIndex(id => id.toString() === userId.toString());
    if (index === -1) {
        ticket.watchers.push(userId);
    } else {
        ticket.watchers.splice(index, 1);
    }

    await ticket.save();
    return ticket;
};

export const submitRating = async (ticketId, ratingData, userId) => {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found');

    if (ticket.client.toString() !== userId.toString()) {
        throw new ApiError(403, 'Only the ticket owner can rate this ticket');
    }

    if (ticket.status !== TICKET_STATUS.RESOLVED && ticket.status !== TICKET_STATUS.CLOSED) {
        throw new ApiError(400, 'Only resolved or closed tickets can be rated');
    }

    ticket.rating = {
        score: ratingData.score,
        comment: ratingData.comment,
        createdAt: new Date()
    };

    await ticket.save();
    return ticket;
};

export const listTickets = async (filters, pagination, user) => {
    const { status, priority, department, client, search } = filters;
    let { page = 1, limit = 10 } = pagination;
    
    // P4: Uncapped Pagination Fix
    limit = Math.min(parseInt(limit), 100);
    page = Math.max(parseInt(page), 1);

    const query = {};

    if (user.role === ROLES.CLIENT) {
        query.client = user._id;
    } else {
        if (client) query.client = client;
    }

    if (status) {
        if (status === 'active') {
            query.status = { $nin: [TICKET_STATUS.ANSWERED, TICKET_STATUS.RESOLVED, TICKET_STATUS.CLOSED] };
        } else if (status === 'closed_group') {
             query.status = { $in: [TICKET_STATUS.ANSWERED, TICKET_STATUS.RESOLVED, TICKET_STATUS.CLOSED] };
        } else {
            query.status = status;
        }
    }
    
    if (priority) query.priority = priority;
    if (department) query.department = department;

    // P1 & P3: Backend Search Support
    if (search) {
        // Sanitize search input to prevent NoSQL injection
        const sanitizedSearch = search.replace(/[<>{}"$]/g, '').substring(0, 100);
        query.$or = [
            { subject: { $regex: sanitizedSearch, $options: 'i' } },
            { ticketId: { $regex: sanitizedSearch, $options: 'i' } }
        ];
    }

    const skip = (page - 1) * limit;

    const tickets = await Ticket.find(query)
        .populate('client', 'name email')
        .populate('department', 'name')
        .populate('assignedTo', 'name')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Ticket.countDocuments(query);

    return {
        tickets,
        total,
        page,
        pages: Math.ceil(total / limit),
    };
};

export const getTicketById = async (ticketId) => {
    let ticket = await Ticket.findById(ticketId);
    if (!ticket && typeof ticketId === 'string') {
        ticket = await Ticket.findOne({ ticketId });
    }
    if (!ticket) throw new ApiError(404, 'Ticket not found');
    return ticket;
};

export const getTicketWithMessages = async (ticketId, user) => {
    // Try to find by _id first, then by ticketId (human-readable ID)
    let ticket = await Ticket.findById(ticketId)
        .populate('client', 'name email')
        .populate('department', 'name')
        .populate('assignedTo', 'name');
    
    // If not found by _id, try ticketId
    if (!ticket && typeof ticketId === 'string') {
        ticket = await Ticket.findOne({ ticketId: ticketId })
            .populate('client', 'name email')
            .populate('department', 'name')
            .populate('assignedTo', 'name');
    }

    if (!ticket) {
        throw new ApiError(404, 'Ticket not found');
    }

    // Use ticket._id for message lookup (it's always an ObjectId)
    const messageQuery = { ticket: ticket._id };
    
    if (user.role === ROLES.CLIENT) {
        messageQuery.isInternal = false;
    }

    const messages = await TicketMessage.find(messageQuery)
        .populate('sender', 'name role')
        .sort({ createdAt: 1 });

    let clientServices = [];
    let clientInvoices = [];
    if (user.role !== ROLES.CLIENT && ticket.client && ticket.client._id) {
        const Service = (await import('../billing/models/Service.js')).default;
        const Invoice = (await import('../billing/models/Invoice.js')).default;
        clientServices = await Service.find({ userId: ticket.client._id, status: 'active' }).sort({ createdAt: -1 }).limit(5);
        clientInvoices = await Invoice.find({ userId: ticket.client._id }).sort({ dateIssued: -1 }).limit(5);
    }

    return { ticket, messages, clientServices, clientInvoices };
};

export const getClientSummary = async (ticketId, user) => {
    let ticket = await Ticket.findById(ticketId)
        .populate('client', 'name email phone company')
        .populate('department', 'name');

    if (!ticket && typeof ticketId === 'string') {
        ticket = await Ticket.findOne({ ticketId })
            .populate('client', 'name email phone company')
            .populate('department', 'name');
    }

    if (!ticket) throw new ApiError(404, 'Ticket not found');

    if (!ticket.client || !ticket.client._id) {
        throw new ApiError(404, 'Ticket has no associated client');
    }

    const Service = (await import('../billing/models/Service.js')).default;
    const Invoice = (await import('../billing/models/Invoice.js')).default;
    const Order = (await import('../billing/models/Order.js')).default;

    const clientId = ticket.client._id;

    const [services, invoices, orders] = await Promise.all([
        Service.find({ userId: clientId })
            .populate('productId', 'name type category slug')
            .populate('orderId', 'orderNumber')
            .sort({ createdAt: -1 }),
        Invoice.find({ userId: clientId })
            .populate('items.serviceId', 'productName status')
            .sort({ dateIssued: -1 })
            .limit(10),
        Order.find({ userId: clientId })
            .populate('items.productId', 'name type')
            .sort({ createdAt: -1 })
            .limit(10),
    ]);

    return {
        client: {
            _id: ticket.client._id,
            name: ticket.client.name,
            email: ticket.client.email,
            phone: ticket.client.phone,
            company: ticket.client.company,
        },
        services,
        invoices,
        orders,
    };
};

export const mergeTickets = async (primaryTicketId, sourceTicketIds, userId, req) => {
    const primaryTicket = await Ticket.findById(primaryTicketId);
    if (!primaryTicket) throw new ApiError(404, 'Primary ticket not found');

    for (const sourceId of sourceTicketIds) {
        if (sourceId === primaryTicketId) continue;
        
        const sourceTicket = await Ticket.findById(sourceId);
        if (!sourceTicket) continue;

        // Move messages
        await TicketMessage.updateMany(
            { ticket: sourceId },
            { $set: { ticket: primaryTicketId } }
        );

        // Update activity
        await TicketActivity.create({
            ticket: primaryTicketId,
            action: 'MERGED',
            performedBy: userId,
            metadata: { sourceTicketId: sourceId, sourceTicketDisplayId: sourceTicket.ticketId }
        });

        // Close source ticket
        sourceTicket.status = TICKET_STATUS.CLOSED;
        sourceTicket.isClosed = true;
        sourceTicket.closedAt = new Date();
        sourceTicket.description += `\n\n[MERGED INTO ${primaryTicket.ticketId}]`;
        await sourceTicket.save();

        await logAction({
            userId,
            action: 'TICKET_MERGED',
            metadata: { primaryTicketId, sourceTicketId: sourceId },
            req,
        });
    }

    return primaryTicket;
};

export const transferDepartment = async (ticketId, newDepartmentId, userId, req) => {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found');

    const department = await Department.findById(newDepartmentId);
    if (!department) throw new ApiError(404, 'Target department not found');

    const oldDepartmentId = ticket.department;
    ticket.department = newDepartmentId;
    await ticket.save();

    await TicketActivity.create({
        ticket: ticket._id,
        action: 'DEPARTMENT_TRANSFERRED',
        performedBy: userId,
        oldValue: oldDepartmentId,
        newValue: newDepartmentId,
    });

    await logAction({
        userId,
        action: 'TICKET_DEPARTMENT_TRANSFER',
        metadata: { ticketId: ticket._id, oldDepartmentId, newDepartmentId },
        req,
    });

    return ticket;
};
