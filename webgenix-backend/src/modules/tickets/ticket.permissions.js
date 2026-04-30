import { ROLES, STAFF_ROLES, TICKET_STATUS } from '../../constants/tickets.js';

const isTicketOwner = (user, ticket) => {
    const clientId = ticket.client?._id ? ticket.client._id.toString() : ticket.client?.toString();
    return clientId === user._id.toString();
};

export const canCreateTicket = (user) => {
    return user && user.role === ROLES.CLIENT;
};

export const canViewTicket = (user, ticket) => {
    if (!user) return false;
    
    // client sees own
    if (user.role === ROLES.CLIENT) {
        return isTicketOwner(user, ticket);
    }
    
    // staff see all (simplified as requested, but constants used)
    return STAFF_ROLES.includes(user.role);
};

export const canReply = (user, ticket) => {
    if (!user) return false;
    
    // client can reply to own open tickets
    if (user.role === ROLES.CLIENT) {
        return isTicketOwner(user, ticket) && ticket.status !== TICKET_STATUS.CLOSED;
    }
    
    // staff always
    return STAFF_ROLES.includes(user.role);
};

export const canAssign = (user) => {
    return user && [ROLES.SUPPORT, ROLES.ADMIN, ROLES.LEAD].includes(user.role);
};

export const canChangeStatus = (user) => {
    return user && [ROLES.SUPPORT, ROLES.ADMIN, ROLES.LEAD].includes(user.role);
};

export const canCloseTicket = (user, ticket) => {
    if (!user) return false;
    
    // client (own)
    if (user.role === ROLES.CLIENT) {
        return isTicketOwner(user, ticket);
    }
    
    // staff
    return STAFF_ROLES.includes(user.role);
};
