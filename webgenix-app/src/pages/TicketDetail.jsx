import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { getTicket, replyToTicket, changeTicketStatus, closeTicket } from '../services/ticket.service';
import { useAuth } from '../context/AuthContext.jsx';
import TicketStatusBadge from '../components/tickets/TicketStatusBadge.jsx';
import TicketPriorityBadge from '../components/tickets/TicketPriorityBadge.jsx';
import MessageThread from '../components/tickets/MessageThread.jsx';
import MessageInput from '../components/tickets/MessageInput.jsx';

export default function TicketDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [ticketData, setTicketData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    
    const messagesEndRef = useRef(null);

    const isStaff = user && ['admin', 'support', 'lead'].includes(user.role);

    const fetchTicketData = async () => {
        try {
            setIsLoading(true);
            setError('');
            console.log('Fetching ticket with ID:', id);
            const response = await getTicket(id);
            console.log('Ticket API response (raw):', response);
            // getTicket returns { success, data: { ticket, messages } }
            const data = response.data;
            console.log('Extracted data:', data);
            
            // Backend returns 404 if ticket not found, so data should always have ticket
            setTicketData(data);
        } catch (err) {
            console.error('Failed to fetch ticket:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            if (err.message === 'Network Error') {
                setError('Cannot connect to server. Please make sure the backend is running on port 5000.');
            } else if (err.response?.status === 401) {
                setError('Session expired. Please log in again.');
            } else if (err.response?.status === 404) {
                setError('Ticket not found. It may have been deleted or you do not have access to it.');
            } else if (err.response?.status === 403) {
                setError('You do not have permission to view this ticket.');
            } else {
                setError(err.response?.data?.message || err.message || 'Failed to load ticket details.');
            }
            setTicketData(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTicketData();
    }, [id]);

    useEffect(() => {
        // Auto-scroll to bottom
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ticketData?.messages]);

    const handleReply = async (message, isInternal) => {
        try {
            setIsSending(true);
            await replyToTicket(id, { message, isInternal });
            await fetchTicketData(); // Refresh to get new message and updated status
        } catch (err) {
            console.error('Failed to send reply:', err);
            setError('Failed to send reply. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    const handleCloseTicket = async () => {
        if (!window.confirm('Are you sure you want to close this ticket?')) return;
        
        try {
            await closeTicket(id);
            await fetchTicketData();
        } catch (err) {
            console.error('Failed to close ticket:', err);
            setError('Failed to close ticket.');
        }
    };

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        if (!newStatus) return;
        
        try {
            await changeTicketStatus(id, newStatus);
            await fetchTicketData();
        } catch (err) {
            console.error('Failed to change status:', err);
            setError('Failed to change status.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen pt-20">
                <div className="animate-spin h-8 w-8 text-accent border-2 border-current border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error || !ticketData) {
        return (
            <div className="container-webgenix py-8">
                <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl">
                    {error || 'Ticket not found'}
                </div>
                <button 
                    onClick={() => navigate('/tickets')}
                    className="mt-4 btn-webgenix bg-dark-700 hover:bg-dark-600"
                >
                    Back to Tickets
                </button>
            </div>
        );
    }

    const { ticket, messages } = ticketData;

    return (
        <div className="container-webgenix py-8 max-w-5xl">
            <button 
                onClick={() => navigate('/tickets')}
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
            >
                <ArrowLeft size={16} />
                Back to Tickets
            </button>

            {error && (
                <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl mb-6">
                    {error}
                </div>
            )}

            {/* Ticket Header */}
            <div className="card-webgenix p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-text-muted font-mono">{ticket.ticketId}</span>
                            <TicketStatusBadge status={ticket.status} />
                            <TicketPriorityBadge priority={ticket.priority} />
                        </div>
                        <h1 className="text-2xl font-bold text-text-primary mb-2">{ticket.subject}</h1>
                        <p className="text-text-secondary whitespace-pre-wrap">{ticket.description}</p>
                    </div>

                    <div className="flex flex-col gap-3 min-w-[200px] shrink-0">
                        {isStaff ? (
                            <select 
                                className="input-webgenix"
                                value={ticket.status}
                                onChange={handleStatusChange}
                            >
                                <option value="OPEN">Open</option>
                                <option value="ANSWERED">Answered</option>
                                <option value="CLIENT_REPLY">Client Reply</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        ) : (
                            !ticket.isClosed && (
                                <button 
                                    onClick={handleCloseTicket}
                                    className="btn-webgenix bg-dark-700 hover:bg-dark-600 text-text-primary flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={16} />
                                    Close Ticket
                                </button>
                            )
                        )}
                        
                        <div className="p-3 bg-dark-800 rounded-lg border border-dark-700 text-sm">
                            <div className="flex justify-between mb-2">
                                <span className="text-text-muted">Client:</span>
                                <div className="text-right">
                                    <span className="text-text-primary font-medium block">{ticket.client?.name || 'Unknown'}</span>
                                    {ticket.client?.email && (
                                        <span className="text-text-muted text-xs">{ticket.client.email}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between mb-1">
                                <span className="text-text-muted">Department:</span>
                                <span className="text-text-primary font-medium">{ticket.department?.name || 'Support'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-muted">Created:</span>
                                <span className="text-text-primary">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-text-primary mb-6">Conversation</h2>
                <div className="card-webgenix p-6 bg-dark-900/50">
                    <MessageThread messages={messages} currentUser={user} />
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Reply Input */}
            {!ticket.isClosed ? (
                <div className="mb-12">
                    <h2 className="text-xl font-semibold text-text-primary mb-4">Reply</h2>
                    <MessageInput 
                        onSend={handleReply} 
                        showInternalToggle={isStaff} 
                        isSending={isSending}
                    />
                </div>
            ) : (
                <div className="card-webgenix p-6 text-center text-text-secondary mb-12">
                    This ticket was closed on {new Date(ticket.closedAt).toLocaleString()}. You cannot reply to a closed ticket.
                </div>
            )}
        </div>
    );
}
