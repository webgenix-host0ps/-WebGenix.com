export const ROLES = {
    ADMIN: 'admin',
    SUPPORT: 'support',
    BILLING: 'billing',
    LEAD: 'lead',
    CLIENT: 'client'
};

export const STAFF_ROLES = [ROLES.ADMIN, ROLES.SUPPORT, ROLES.BILLING, ROLES.LEAD];

export const TICKET_STATUS = {
    OPEN: 'OPEN',
    ANSWERED: 'ANSWERED',
    CLIENT_REPLY: 'CLIENT_REPLY',
    IN_PROGRESS: 'IN_PROGRESS',
    ON_HOLD: 'ON_HOLD',
    WAITING_FOR_3RD_PARTY: 'WAITING_FOR_3RD_PARTY',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED'
};

export const TICKET_PRIORITY = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT'
};
