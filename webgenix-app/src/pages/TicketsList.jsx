import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Plus, Filter, Inbox, MessageSquare, CheckCircle, 
    Clock, AlertCircle, Search, RefreshCw, ChevronRight, 
    LayoutDashboard, Bell, LogOut, ChevronDown, Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTickets } from '../services/ticket.service';
import TicketCard from '../components/tickets/TicketCard.jsx';

export default function TicketsList() {
    const { user, logout } = useAuth();
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

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

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

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <div className="min-h-screen bg-[#05070b] text-text-primary font-sans selection:bg-accent/30 selection:text-white pb-20">
            {/* Top Authenticated Header */}
            <header className="sticky top-0 z-50 bg-[rgba(17,20,28,0.8)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] px-6 lg:px-10 h-20 flex items-center justify-between">
                <Link to="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center shadow-lg shadow-accent/20 group-hover:shadow-accent/40 transition-all">
                        <span className="text-white font-bold text-sm">W</span>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">WebGenix</span>
                </Link>
                
                <div className="flex items-center gap-5">
                    <button className="text-text-secondary hover:text-white transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full"></span>
                    </button>
                    <div className="h-6 w-px bg-[rgba(255,255,255,0.1)]"></div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-white">{user?.name || 'Client User'}</p>
                            <p className="text-xs text-text-muted">Pro Support Active</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-dark-700 border border-[rgba(255,255,255,0.05)] flex items-center justify-center text-sm font-semibold text-white shadow-inner">
                            {getInitials(user?.name)}
                        </div>
                    </div>
                    <button onClick={handleLogout} className="ml-2 text-text-secondary hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-[1400px] w-[88%] mx-auto mt-[32px]">
                
                {/* Page Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-[32px]">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-3">
                            <Link to="/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
                                <LayoutDashboard size={14} />
                                Dashboard
                            </Link>
                            <ChevronRight size={14} className="text-text-muted/50" />
                            <span className="text-accent">Support Tickets</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                            Support Tickets
                        </h1>
                        <p className="text-text-secondary text-sm md:text-base">
                            Track your active inquiries and communicate with our team.
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <button onClick={() => navigate('/tickets/new')} className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover shadow-lg shadow-accent/20 text-white text-sm font-medium transition-all hover:-translate-y-0.5 flex items-center gap-2">
                            <Plus size={16} />
                            Create New Ticket
                        </button>
                    </div>
                </div>

                {/* Summary Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px] mb-[32px]">
                    <div className="bg-[rgba(17,20,28,0.88)] border border-[rgba(255,255,255,0.06)] p-6 rounded-2xl group hover:border-blue-500/30 transition-all relative overflow-hidden">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                            <Inbox className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">{stats.total}</h3>
                        <p className="text-text-secondary text-sm">Total Submissions</p>
                    </div>

                    <div className="bg-[rgba(17,20,28,0.88)] border border-[rgba(255,255,255,0.06)] p-6 rounded-2xl group hover:border-amber-500/30 transition-all relative overflow-hidden">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                            <Clock className="w-6 h-6 text-amber-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">{stats.open}</h3>
                        <p className="text-text-secondary text-sm">Active & Open</p>
                    </div>

                    <div className="bg-[rgba(17,20,28,0.88)] border border-[rgba(255,255,255,0.06)] p-6 rounded-2xl group hover:border-green-500/30 transition-all relative overflow-hidden">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                            <MessageSquare className="w-6 h-6 text-green-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">{stats.answered}</h3>
                        <p className="text-text-secondary text-sm">Waiting for You</p>
                    </div>

                    <div className="bg-[rgba(17,20,28,0.88)] border border-[rgba(255,255,255,0.06)] p-6 rounded-2xl group hover:border-purple-500/30 transition-all relative overflow-hidden">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                            <CheckCircle className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">{stats.closed}</h3>
                        <p className="text-text-secondary text-sm">Resolved Cases</p>
                    </div>
                </div>

                {/* Toolbar Area */}
                <div className="bg-[rgba(17,20,28,0.88)] border border-[rgba(255,255,255,0.06)] p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4 mb-[24px]">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input 
                            type="text" 
                            placeholder="Search by subject or ID..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-text-muted focus:outline-none focus:border-accent/50 transition-all"
                        />
                    </div>

                    <div className="flex p-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)] rounded-xl">
                        <button onClick={() => setActiveTab('active')} className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'active' ? 'bg-[rgba(255,255,255,0.08)] text-white shadow-sm' : 'text-text-secondary hover:text-white'}`}>
                            Active
                        </button>
                        <button onClick={() => setActiveTab('closed')} className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'closed' ? 'bg-[rgba(255,255,255,0.08)] text-white shadow-sm' : 'text-text-secondary hover:text-white'}`}>
                            Closed
                        </button>
                    </div>

                    <div className="flex items-center gap-3 ml-auto w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none w-full md:w-40 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl pl-4 pr-10 py-2.5 text-sm text-text-secondary hover:text-white cursor-pointer focus:outline-none focus:border-accent/50 transition-colors"
                            >
                                <option value="" className="bg-dark-800">All Statuses</option>
                                <option value="OPEN" className="bg-dark-800">Open</option>
                                <option value="ANSWERED" className="bg-dark-800">Answered</option>
                                <option value="CLIENT_REPLY" className="bg-dark-800">Client Reply</option>
                                <option value="IN_PROGRESS" className="bg-dark-800">In Progress</option>
                                <option value="RESOLVED" className="bg-dark-800">Resolved</option>
                                <option value="CLOSED" className="bg-dark-800">Closed</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                        </div>

                        <div className="relative flex-1 md:flex-none">
                            <select 
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="appearance-none w-full md:w-40 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl pl-4 pr-10 py-2.5 text-sm text-text-secondary hover:text-white cursor-pointer focus:outline-none focus:border-accent/50 transition-colors"
                            >
                                <option value="" className="bg-dark-800">All Priorities</option>
                                <option value="LOW" className="bg-dark-800">Low</option>
                                <option value="MEDIUM" className="bg-dark-800">Medium</option>
                                <option value="HIGH" className="bg-dark-800">High</option>
                                <option value="URGENT" className="bg-dark-800">Urgent</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                        </div>

                        <button onClick={fetchTickets} className="p-2.5 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl text-text-secondary hover:text-white transition-colors" title="Refresh List">
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* List Container */}
                <div className="animate-slide-up-webgenix">
                    {isLoading && allTickets.length === 0 ? (
                        <div className="text-center py-20 bg-[rgba(17,20,28,0.88)] border border-[rgba(255,255,255,0.04)] rounded-2xl">
                            <RefreshCw className="w-10 h-10 text-accent animate-spin mx-auto mb-4" />
                            <p className="text-text-secondary font-medium">Synchronizing your support tickets...</p>
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
                        <div className="text-center py-20 bg-[rgba(17,20,28,0.88)] border border-[rgba(255,255,255,0.04)] border-dashed rounded-2xl">
                            <Inbox className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-20" />
                            <h3 className="text-xl font-semibold text-white mb-2">No tickets found</h3>
                            <p className="text-text-secondary mb-8">It seems we couldn't find any tickets matching your current search or filters.</p>
                            <button 
                                onClick={() => { setSearchQuery(''); setStatusFilter(''); setPriorityFilter(''); }}
                                className="px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
