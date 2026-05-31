import api from './api';

export const createTicket = async (ticketData) => {
    const response = await api.post('/tickets', ticketData);
    return response.data;
};

export const getTickets = async (params) => {
    // Clean empty string params
    const cleanParams = Object.fromEntries(
        Object.entries(params || {}).filter(([_, v]) => v !== '')
    );
    const response = await api.get('/tickets', { params: cleanParams });
    return response.data;
};

export const getTicket = async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}`);
    return response.data;
};

export const replyToTicket = async (ticketId, messageData) => {
    const response = await api.post(`/tickets/${ticketId}/messages`, messageData);
    return response.data;
};

export const changeTicketStatus = async (ticketId, status) => {
    const response = await api.patch(`/tickets/${ticketId}/status`, { status });
    return response.data;
};

export const assignTicket = async (ticketId, assignedTo) => {
    const response = await api.patch(`/tickets/${ticketId}/assign`, { assignedTo });
    return response.data;
};

export const closeTicket = async (ticketId) => {
    const response = await api.post(`/tickets/${ticketId}/close`);
    return response.data;
};

export const getPredefinedReplies = async (departmentId) => {
    const response = await api.get('/tickets/settings/predefined-replies', { params: { departmentId } });
    return response.data;
};

export const toggleWatcher = async (ticketId) => {
    const response = await api.post(`/tickets/${ticketId}/watch`);
    return response.data;
};

export const mergeTickets = async (primaryTicketId, sourceTicketIds) => {
    const response = await api.post(`/tickets/${primaryTicketId}/merge`, { sourceTicketIds });
    return response.data;
};

export const transferTicket = async (ticketId, departmentId) => {
    const response = await api.patch(`/tickets/${ticketId}/transfer`, { departmentId });
    return response.data;
};

export const getDepartments = async () => {
    const response = await api.get('/tickets/departments');
    return response.data;
};

export const getClientSummary = async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}/client-summary`);
    return response.data;
};
