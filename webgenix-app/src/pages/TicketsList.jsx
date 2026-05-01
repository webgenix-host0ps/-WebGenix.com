import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Inbox } from 'lucide-react';
import { getTickets } from '../services/ticket.service';
import TicketCard from '../components/tickets/TicketCard.jsx';
import EmptyState from '../components/tickets/EmptyState.jsx';

export default function TicketsList() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ status: '', priority: '' });
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'closed'

    const fetchTickets = async () => {
        try {
            setIsLoading(true);
            const response = await getTickets({ ...filters, limit: 100 });
            // ticket.service returns backend response directly: { success, data: tickets[], meta }
            let filtered = response.data || [];
            console.log('Tickets from API:', filtered);
            if (filtered.length > 0) {
                console.log('First ticket ID:', filtered[0]._id);
            }

            if (!filters.status) {
                if (activeTab === 'active') {
                    filtered = filtered.filter(t => !['RESOLVED', 'CLOSED'].includes(t.status?.toUpperCase()));
                } else {
                    filtered = filtered.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status?.toUpperCase()));
                }
            }

            setTickets(filtered);
            setError('');
        } catch (err) {
            console.error('Failed to fetch tickets:', err);
            if (err.message === 'Network Error') {
                setError('Cannot connect to server. Please make sure the backend is running on port 5000.');
            } else if (err.response?.status === 401) {
                setError('Session expired. Please log in again.');
            } else {
                setError(err.response?.data?.message || 'Failed to load tickets. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchTickets();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [filters, activeTab]);

    return (
        <div className="container-webgenix py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-2">Support Tickets</h1>
                    <p className="text-text-secondary">Manage and track your support requests.</p>
                </div>
                <button 
                    onClick={() => navigate('/tickets/new')}
                    className="btn-webgenix btn-primary-webgenix flex items-center gap-2"
                >
                    <Plus size={18} />
                    New Ticket
                </button>
            </div>

            <div className="flex gap-4 mb-6 border-b border-dark-700">
                <button 
                    onClick={() => { setActiveTab('active'); setFilters(f => ({...f, status: ''})); }}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'active' ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}
                >
                    Active Tickets
                    {activeTab === 'active' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
                </button>
                <button 
                    onClick={() => { setActiveTab('closed'); setFilters(f => ({...f, status: ''})); }}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'closed' ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}
                >
                    Closed Tickets
                    {activeTab === 'closed' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
                </button>
            </div>

            <div className="card-webgenix p-4 mb-8 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-text-muted">
                    <Filter size={18} />
                    <span className="text-sm font-medium">Filters:</span>
                </div>
                
                <select 
                    className="input-webgenix max-w-[200px]"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                    <option value="">All Statuses</option>
                    <option value="OPEN">Open</option>
                    <option value="ANSWERED">Answered</option>
                    <option value="CLIENT_REPLY">Client Reply</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                </select>

                <select 
                    className="input-webgenix max-w-[200px]"
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                >
                    <option value="">All Priorities</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                </select>
            </div>

            {error && (
                <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl mb-6">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin h-8 w-8 text-accent border-2 border-current border-t-transparent rounded-full" />
                </div>
            ) : tickets.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {tickets.map(ticket => (
                        <TicketCard 
                            key={ticket._id} 
                            ticket={ticket} 
                            onClick={() => {
                                // Try using _id first, fallback to ticketId
                                const navId = ticket._id || ticket.ticketId;
                                console.log('Navigating to ticket:', navId, 'Full ticket:', ticket);
                                navigate(`/tickets/${navId}`);
                            }} 
                        />
                    ))}
                </div>
            ) : (
                <EmptyState 
                    icon={Inbox}
                    title="No tickets found"
                    message="You don't have any tickets matching the current filters."
                    actionLabel={filters.status || filters.priority ? "Clear Filters" : "Create New Ticket"}
                    onAction={() => filters.status || filters.priority ? setFilters({ status: '', priority: '' }) : navigate('/tickets/new')}
                />
            )}
        </div>
    );
}
