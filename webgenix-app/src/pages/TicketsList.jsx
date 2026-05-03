import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Plus, Filter, Inbox, MessageSquare, CheckCircle, 
    Clock, AlertCircle, Search, RefreshCw, ChevronRight, 
    ChevronDown, Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTickets } from '../services/ticket.service';
import TicketCard from '../components/tickets/TicketCard.jsx';
import DashboardLayout from '../components/dashboard/DashboardLayout';

export default function TicketsList() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [allTickets, setAllTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'closed'

    const fetchTickets = async () => {
        try {
            setIsLoading(true);
            const response = await getTickets({ limit: 500 });
            setAllTickets(response.data || []);
            setError('');
        } catch (err) {
            console.error('Failed to fetch tickets:', err);
            setError('Failed to load tickets. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    // Calculate Global Stats
    const stats = useMemo(() => {
        let total = allTickets.length;
        let open = allTickets.filter(t => ['OPEN', 'CLIENT_REPLY', 'IN_PROGRESS'].includes(t.status?.toUpperCase())).length;
        let answered = allTickets.filter(t => t.status?.toUpperCase() === 'ANSWERED').length;
        let closed = allTickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status?.toUpperCase())).length;
        return { total, open, answered, closed };
    }, [allTickets]);

    // Derived filtered list for display
    const filteredTickets = useMemo(() => {
        let list = allTickets;

        // Tab Filter (Active vs Closed)
        if (activeTab === 'active') {
            list = list.filter(t => !['RESOLVED', 'CLOSED'].includes(t.status?.toUpperCase()));
        } else {
            list = list.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status?.toUpperCase()));
        }

        // Dropdown Filters
        if (statusFilter) {
            list = list.filter(t => t.status?.toUpperCase() === statusFilter.toUpperCase());
        }
        if (priorityFilter) {
            list = list.filter(t => t.priority?.toUpperCase() === priorityFilter.toUpperCase());
        }

        // Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(t => 
                t.subject?.toLowerCase().includes(q) || 
                t.ticketId?.toLowerCase().includes(q) ||
                (t._id && t._id.toLowerCase().includes(q))
            );
        }

        return list;
    }, [allTickets, activeTab, statusFilter, priorityFilter, searchQuery]);

    return (
        <DashboardLayout>
            <div className="space-y-[32px] animate-in fade-in duration-700">
                
                {/* Page Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-text-muted mb-4 opacity-60">
                            <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                            <ChevronRight size={12} />
                            <span className="text-accent">Support Center</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-text-primary tracking-tight mb-4">
                            Support Tickets
                        </h1>
                        <p className="text-text-secondary text-sm md:text-base max-w-xl leading-relaxed">
                            Get help from our expert support team. Track your existing tickets or create a new request for assistance.
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => navigate('/tickets/new')} 
                        className="px-8 py-4 rounded-2xl bg-accent hover:bg-accent-hover text-white text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-accent/20 hover:-translate-y-1 active:scale-95 flex items-center gap-2 w-fit"
                    >
                        <Plus size={16} /> New Ticket
                    </button>
                </div>

                {/* Status Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Tickets', value: stats.total, icon: Inbox, color: 'blue' },
                        { label: 'Open Tickets', value: stats.open, icon: Clock, color: 'amber' },
                        { label: 'Answered', value: stats.answered, icon: MessageSquare, color: 'purple' },
                        { label: 'Resolved', value: stats.closed, icon: CheckCircle, color: 'green' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white/[0.03] border border-white/[0.06] p-6 rounded-[28px] group hover:border-accent/30 transition-all duration-300">
                            <div className={`w-10 h-10 rounded-xl bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center mb-4 text-${item.color}-400 group-hover:scale-110 transition-transform`}>
                                <item.icon size={20} />
                            </div>
                            <h3 className="text-3xl font-black text-text-primary mb-1 tracking-tight">{item.value}</h3>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* Toolbar & Filters */}
                <div className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-[28px] flex flex-col xl:flex-row items-center gap-4">
                    {/* Tabs */}
                    <div className="flex p-1.5 bg-dark-900/40 rounded-2xl w-full xl:w-auto">
                        <button 
                            onClick={() => setActiveTab('active')} 
                            className={`flex-1 xl:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text-muted hover:text-white'}`}
                        >
                            Active
                        </button>
                        <button 
                            onClick={() => setActiveTab('closed')} 
                            className={`flex-1 xl:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'closed' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text-muted hover:text-white'}`}
                        >
                            Past Tickets
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative w-full xl:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search by ID or Subject..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-text-muted/50 focus:outline-none focus:border-accent/30 transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto ml-auto">
                        {/* Status Filter */}
                        <div className="relative flex-1 xl:flex-none min-w-[140px]">
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl pl-4 pr-10 py-3 text-xs font-black uppercase tracking-widest text-white appearance-none focus:outline-none focus:border-accent/30 transition-all cursor-pointer"
                            >
                                <option value="" className="bg-dark-900">All Statuses</option>
                                <option value="OPEN" className="bg-dark-900">Open</option>
                                <option value="ANSWERED" className="bg-dark-900">Answered</option>
                                <option value="CLIENT_REPLY" className="bg-dark-900">Client Reply</option>
                                <option value="IN_PROGRESS" className="bg-dark-900">In Progress</option>
                                <option value="RESOLVED" className="bg-dark-900">Resolved</option>
                                <option value="CLOSED" className="bg-dark-900">Closed</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                        </div>

                        {/* Priority Filter */}
                        <div className="relative flex-1 xl:flex-none min-w-[140px]">
                            <select 
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl pl-4 pr-10 py-3 text-xs font-black uppercase tracking-widest text-white appearance-none focus:outline-none focus:border-accent/30 transition-all cursor-pointer"
                            >
                                <option value="" className="bg-dark-800">All Priorities</option>
                                <option value="LOW" className="bg-dark-800">Low</option>
                                <option value="MEDIUM" className="bg-dark-800">Medium</option>
                                <option value="HIGH" className="bg-dark-800">High</option>
                                <option value="URGENT" className="bg-dark-800">Urgent</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                        </div>

                        <button onClick={fetchTickets} className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-text-secondary hover:text-white transition-all hover:bg-white/[0.08]" title="Refresh List">
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* List Container */}
                <div className="animate-slide-up-webgenix">
                    {isLoading && allTickets.length === 0 ? (
                        <div className="text-center py-20 bg-white/[0.02] border border-white/[0.06] rounded-[32px]">
                            <RefreshCw className="w-10 h-10 text-accent animate-spin mx-auto mb-4" />
                            <p className="text-text-secondary font-bold uppercase tracking-widest text-[10px]">Loading tickets...</p>
                        </div>
                    ) : filteredTickets.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredTickets.map(ticket => (
                                <TicketCard 
                                    key={ticket._id} 
                                    ticket={ticket} 
                                    onClick={() => {
                                        const navId = ticket._id || ticket.ticketId;
                                        navigate(`/tickets/${navId}`);
                                    }} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white/[0.01] border border-white/[0.06] border-dashed rounded-[40px]">
                            <Inbox className="w-16 h-16 text-text-muted mx-auto mb-6 opacity-20" />
                            <h3 className="text-2xl font-black text-text-primary mb-2 uppercase tracking-tight">No tickets found</h3>
                            <p className="text-text-secondary mb-10 font-bold uppercase tracking-widest text-[10px] opacity-60">We couldn't find any tickets matching your search.</p>
                            <button 
                                onClick={() => { setSearchQuery(''); setStatusFilter(''); setPriorityFilter(''); }}
                                className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-accent hover:text-white transition-all"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>

                <div className="h-10" />
            </div>
        </DashboardLayout>
    );
}
