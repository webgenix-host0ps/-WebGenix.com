import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
    User, LogOut, LayoutDashboard, Server, CreditCard, Settings, TicketIcon, 
    Plus, ShoppingBag, Shield, Globe, Lock, ArrowRight, ExternalLink, Activity, DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getTickets } from '../../services/ticket.service';
import api from '../../services/api';
import TicketCard from '../../components/tickets/TicketCard.jsx';
import Marketplace from '../../components/marketplace/Marketplace.jsx';

const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Overview', tab: 'overview' },
    { icon: ShoppingBag, label: 'Marketplace', tab: 'marketplace' },
    { icon: Server, label: 'My Services', tab: 'my-services' },
    { icon: CreditCard, label: 'Billing', tab: 'billing' },
    { icon: TicketIcon, label: 'Support Tickets', tab: 'tickets' },
    { icon: Settings, label: 'Settings', tab: 'settings' },
];

export default function ClientDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [activeTab, setActiveTab] = useState('overview');
    const [recentTickets, setRecentTickets] = useState([]);
    const [services, setServices] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [stats, setStats] = useState({ open: 0, total: 0, activeServices: 0, pendingInvoices: 0, pendingAmount: 0 });

    useEffect(() => {
        const path = location.pathname;
        if (path === '/dashboard' || path === '/dashboard/') {
            setActiveTab('overview');
        } else if (path.includes('marketplace')) {
            setActiveTab('marketplace');
        } else if (path.includes('my-services')) {
            setActiveTab('my-services');
        } else if (path.includes('billing')) {
            setActiveTab('billing');
        } else if (path.includes('settings')) {
            setActiveTab('settings');
        }
    }, [location]);

    useEffect(() => {
        if (user) {
            const fetchDashboardData = async () => {
                try {
                    const ticketRes = await getTickets({ limit: 4 });
                    const tickets = ticketRes.data || [];
                    setRecentTickets(tickets);
                    const openTickets = tickets.filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length;
                    
                    let activeSrv = 0;
                    let srvs = [];
                    try {
                        const srvRes = await api.get('/billing/services', { params: { limit: 3 } });
                        srvs = srvRes.data?.data?.services || srvRes.data?.data || [];
                        setServices(srvs);
                        activeSrv = srvs.filter(s => s.status === 'active').length;
                    } catch (e) {}

                    let pendingInv = 0;
                    let invs = [];
                    let pendingAmt = 0;
                    try {
                        const invRes = await api.get('/billing/invoices', { params: { limit: 3 } });
                        invs = invRes.data?.data?.invoices || invRes.data?.data || [];
                        setInvoices(invs);
                        const unpaid = invs.filter(i => i.status === 'unpaid');
                        pendingInv = unpaid.length;
                        pendingAmt = unpaid.reduce((sum, inv) => sum + (inv.amountDue || inv.total || 0), 0);
                    } catch (e) {}

                    setStats({ 
                        open: openTickets, 
                        total: ticketRes.meta?.total || tickets.length,
                        activeServices: activeSrv,
                        pendingInvoices: pendingInv,
                        pendingAmount: pendingAmt
                    });
                } catch (err) {
                    console.error('Failed to fetch dashboard data', err);
                }
            };
            fetchDashboardData();
        }
    }, [user]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <div className="min-h-screen bg-[#05070b] text-text-primary font-sans selection:bg-accent/30 selection:text-white">
            <div className="flex h-screen overflow-hidden">
                
                {/* Slim Premium Sidebar */}
                <aside className="w-[260px] flex-shrink-0 flex flex-col bg-[rgba(17,20,28,0.6)] backdrop-blur-2xl border-r border-[rgba(255,255,255,0.04)] hidden lg:flex relative z-20">
                    {/* Brand */}
                    <div className="h-20 flex items-center px-6 border-b border-[rgba(255,255,255,0.04)]">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center shadow-lg shadow-accent/20 group-hover:shadow-accent/40 transition-all">
                                <span className="text-white font-bold text-sm">W</span>
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">WebGenix</span>
                        </Link>
                    </div>

                    {/* Profile Block */}
                    <div className="px-5 py-6">
                        <div className="flex items-center gap-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-xl p-3">
                            <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-sm font-semibold border border-[rgba(255,255,255,0.05)] text-white shadow-inner">
                                {getInitials(user.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm text-white truncate">{user.name}</p>
                                <p className="text-xs text-text-muted truncate">Enterprise Client</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
                        <p className="px-4 text-[10px] font-bold tracking-widest text-text-muted uppercase mb-3 mt-2">Main Menu</p>
                        {sidebarLinks.map((link) => {
                            const href = link.tab === 'overview' ? '/dashboard' : 
                                         link.tab === 'tickets' ? '/tickets' :
                                         link.tab === 'billing' ? '/billing' :
                                         link.tab === 'my-services' ? '/my-services' :
                                         link.tab === 'settings' ? '/settings' :
                                         `/dashboard/${link.tab}`;
                                         
                            const isActive = activeTab === link.tab;
                            
                            return (
                                <Link
                                    key={link.label}
                                    to={href}
                                    className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group overflow-hidden ${
                                        isActive
                                            ? 'text-white'
                                            : 'text-text-secondary hover:text-white hover:bg-[rgba(255,255,255,0.03)]'
                                    }`}
                                >
                                    {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent opacity-100" />
                                    )}
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                                    )}
                                    <link.icon size={18} className={`relative z-10 ${isActive ? 'text-accent' : 'text-text-muted group-hover:text-text-primary transition-colors'}`} />
                                    <span className="relative z-10">{link.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Action */}
                    <div className="p-4 border-t border-[rgba(255,255,255,0.04)]">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full border border-transparent hover:border-red-500/20"
                        >
                            <LogOut size={18} />
                            Sign Out
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto relative z-10">
                    {/* Background glows */}
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
                    <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

                    {/* Mobile Header Overlay */}
                    <div className="lg:hidden flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.04)] bg-[#05070b]">
                         <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">W</span>
                            </div>
                            <span className="text-xl font-bold text-white">WebGenix</span>
                        </Link>
                        <button onClick={handleLogout} className="text-red-400 p-2">
                            <LogOut size={20} />
                        </button>
                    </div>

                    <div className="max-w-[1400px] mx-auto w-full px-6 py-8 md:px-10 md:py-10">
                        
                        {/* Tab Content Router */}
                        {activeTab === 'marketplace' ? (
                            <Marketplace />
                        ) : activeTab === 'my-services' ? (
                            <Navigate to="/my-services" replace />
                        ) : activeTab === 'billing' ? (
                            <Navigate to="/billing" replace />
                        ) : activeTab === 'tickets' ? (
                            <Navigate to="/tickets" replace />
                        ) : (
                        <div className="space-y-[32px]">
                            
                            {/* Top Dashboard Header */}
                            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-[rgba(17,20,28,0.4)] backdrop-blur-md border border-[rgba(255,255,255,0.06)] p-8 rounded-3xl">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)] text-xs font-medium text-text-secondary mb-4">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                                        System Operational
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                                        Welcome back, {user.name.split(' ')[0]}
                                    </h1>
                                    <p className="text-text-secondary text-sm md:text-base max-w-xl">
                                        Here is your account and service overview. Everything looks good.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <button onClick={() => navigate('/tickets/new')} className="px-5 py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.08)] text-sm font-medium transition-colors flex items-center gap-2 text-white">
                                        <Plus size={16} />
                                        New Ticket
                                    </button>
                                    <button onClick={() => navigate('/dashboard/marketplace')} className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover shadow-lg shadow-accent/20 text-white text-sm font-medium transition-all hover:-translate-y-0.5 flex items-center gap-2">
                                        <ShoppingBag size={16} />
                                        Browse Marketplace
                                    </button>
                                </div>
                            </div>

                            {/* Premium Metric Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px]">
                                {/* Card 1 */}
                                <div className="bg-[rgba(17,20,28,0.88)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] p-[22px] rounded-2xl relative overflow-hidden group hover:border-accent/30 transition-colors">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <TicketIcon size={64} className="text-accent transform rotate-12 translate-x-4 -translate-y-4" />
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4 relative z-10">
                                        <TicketIcon size={20} className="text-accent" />
                                    </div>
                                    <p className="text-text-secondary text-sm font-medium mb-1 relative z-10">Open Tickets</p>
                                    <h3 className="text-3xl font-bold text-white mb-1 relative z-10">{stats.open}</h3>
                                    <p className="text-xs text-text-muted relative z-10">Requires attention</p>
                                </div>

                                {/* Card 2 */}
                                <div className="bg-[rgba(17,20,28,0.88)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] p-[22px] rounded-2xl relative overflow-hidden group hover:border-green-500/30 transition-colors">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Shield size={64} className="text-green-500 transform rotate-12 translate-x-4 -translate-y-4" />
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4 relative z-10">
                                        <Shield size={20} className="text-green-500" />
                                    </div>
                                    <p className="text-text-secondary text-sm font-medium mb-1 relative z-10">Account Status</p>
                                    <h3 className="text-3xl font-bold text-green-400 mb-1 relative z-10">Active</h3>
                                    <p className="text-xs text-text-muted relative z-10">{user.emailVerified ? 'Email verified' : 'Action required'}</p>
                                </div>

                                {/* Card 3 */}
                                <div className="bg-[rgba(17,20,28,0.88)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] p-[22px] rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <DollarSign size={64} className="text-amber-500 transform rotate-12 translate-x-4 -translate-y-4" />
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 relative z-10">
                                        <DollarSign size={20} className="text-amber-500" />
                                    </div>
                                    <p className="text-text-secondary text-sm font-medium mb-1 relative z-10">Pending Billing</p>
                                    <h3 className="text-3xl font-bold text-white mb-1 relative z-10">₹{stats.pendingAmount.toFixed(2)}</h3>
                                    <p className="text-xs text-text-muted relative z-10">{stats.pendingInvoices} invoice(s) due</p>
                                </div>

                                {/* Card 4 */}
                                <div className="bg-[rgba(17,20,28,0.88)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] p-[22px] rounded-2xl relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Activity size={64} className="text-purple-500 transform rotate-12 translate-x-4 -translate-y-4" />
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 relative z-10">
                                        <Activity size={20} className="text-purple-500" />
                                    </div>
                                    <p className="text-text-secondary text-sm font-medium mb-1 relative z-10">Active Services</p>
                                    <h3 className="text-3xl font-bold text-white mb-1 relative z-10">{stats.activeServices}</h3>
                                    <p className="text-xs text-text-muted relative z-10">Online & running</p>
                                </div>
                            </div>

                            {/* Active Services Overview */}
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white">Services Overview</h2>
                                    <Link to="/my-services" className="text-sm font-medium text-accent hover:text-white flex items-center gap-1 transition-colors">
                                        Manage All <ArrowRight size={16} />
                                    </Link>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
                                    {/* Placeholder Service Card 1 */}
                                    <div className="bg-[rgba(17,20,28,0.88)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] p-[22px] rounded-2xl flex flex-col hover:border-[rgba(255,255,255,0.15)] transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center">
                                                <Server className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                                Active
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-white mb-1">{services[0]?.productName || 'Premium Cloud VPS'}</h3>
                                        <p className="text-sm text-text-muted mb-6">{services[0]?.domain || 'webgenix.com'}</p>
                                        <div className="mt-auto pt-4 border-t border-[rgba(255,255,255,0.04)] flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-text-muted uppercase tracking-wider">Next Due</span>
                                                <span className="text-sm font-medium text-white">{services[0]?.nextDueDate ? new Date(services[0].nextDueDate).toLocaleDateString() : 'Dec 12, 2026'}</span>
                                            </div>
                                            <button onClick={() => navigate('/my-services')} className="text-accent hover:text-white p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                                                <ExternalLink size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Placeholder Service Card 2 */}
                                    <div className="bg-[rgba(17,20,28,0.88)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] p-[22px] rounded-2xl flex flex-col hover:border-[rgba(255,255,255,0.15)] transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/5 flex items-center justify-center">
                                                <Globe className="w-6 h-6 text-amber-400" />
                                            </div>
                                            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                                Active
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-white mb-1">{services[1]?.productName || 'Domain Registration'}</h3>
                                        <p className="text-sm text-text-muted mb-6">{services[1]?.domain || 'example.com'}</p>
                                        <div className="mt-auto pt-4 border-t border-[rgba(255,255,255,0.04)] flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-text-muted uppercase tracking-wider">Expires</span>
                                                <span className="text-sm font-medium text-white">{services[1]?.nextDueDate ? new Date(services[1].nextDueDate).toLocaleDateString() : 'Jan 05, 2027'}</span>
                                            </div>
                                            <button onClick={() => navigate('/my-services')} className="text-accent hover:text-white p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                                                <ExternalLink size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Placeholder Service Card 3 */}
                                    <div className="bg-[rgba(17,20,28,0.88)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] p-[22px] rounded-2xl flex flex-col hover:border-[rgba(255,255,255,0.15)] transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/5 flex items-center justify-center">
                                                <Lock className="w-6 h-6 text-green-400" />
                                            </div>
                                            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                                Installed
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-white mb-1">SSL Certificate</h3>
                                        <p className="text-sm text-text-muted mb-6">Wildcard SSL Coverage</p>
                                        <div className="mt-auto pt-4 border-t border-[rgba(255,255,255,0.04)] flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-text-muted uppercase tracking-wider">Renews</span>
                                                <span className="text-sm font-medium text-white">Auto-Renew enabled</span>
                                            </div>
                                            <button onClick={() => navigate('/my-services')} className="text-accent hover:text-white p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                                                <ExternalLink size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Support Tickets Section */}
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white">Recent Support Tickets</h2>
                                    <Link to="/tickets" className="text-sm font-medium text-accent hover:text-white flex items-center gap-1 transition-colors">
                                        View All Tickets <ArrowRight size={16} />
                                    </Link>
                                </div>
                                
                                {recentTickets.length > 0 ? (
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-[24px]">
                                        {recentTickets.map(ticket => (
                                            <TicketCard 
                                                key={ticket._id} 
                                                ticket={ticket} 
                                                onClick={() => navigate(`/tickets/${ticket._id}`)} 
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-[rgba(17,20,28,0.88)] backdrop-blur-xl border border-[rgba(255,255,255,0.04)] border-dashed rounded-3xl p-12 text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center mx-auto mb-4">
                                            <TicketIcon className="w-8 h-8 text-text-muted" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-white mb-2">No active tickets</h3>
                                        <p className="text-text-secondary text-sm max-w-md mx-auto mb-6">Everything seems to be running smoothly. If you need assistance, our support team is ready to help.</p>
                                        <button onClick={() => navigate('/tickets/new')} className="px-5 py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-white text-white hover:text-black text-sm font-medium transition-all">
                                            Open Support Ticket
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Billing & Invoices Summary Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
                                {/* Recent Invoices List */}
                                <div className="lg:col-span-2 bg-[rgba(17,20,28,0.88)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-bold text-white">Recent Invoices</h2>
                                        <Link to="/billing" className="text-xs font-medium text-accent hover:text-white transition-colors">
                                            View Billing History
                                        </Link>
                                    </div>
                                    <div className="space-y-3">
                                        {invoices.length > 0 ? invoices.map(inv => (
                                            <div key={inv._id} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.04)] transition-colors cursor-pointer" onClick={() => navigate('/billing')}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-2 h-2 rounded-full ${inv.status === 'paid' ? 'bg-green-500' : 'bg-amber-500'}`} />
                                                    <div>
                                                        <p className="font-medium text-sm text-white">{inv.invoiceNumber || 'INV-PENDING'}</p>
                                                        <p className="text-xs text-text-muted">{new Date(inv.dateIssued || inv.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-sm text-white">₹{inv.total?.toFixed(2) || inv.amountDue?.toFixed(2)}</p>
                                                    <p className={`text-[10px] font-bold uppercase tracking-wider ${inv.status === 'paid' ? 'text-green-500' : 'text-amber-500'}`}>{inv.status}</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-6 border border-dashed border-[rgba(255,255,255,0.05)] rounded-xl">
                                                <p className="text-sm text-text-muted">No recent invoices found.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Quick Payment Card */}
                                <div className="bg-gradient-to-br from-accent/20 to-purple-600/20 backdrop-blur-xl border border-accent/20 rounded-2xl p-6 flex flex-col justify-center text-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 border border-white/10 relative z-10">
                                        <CreditCard className="text-white w-6 h-6" />
                                    </div>
                                    <h3 className="text-white font-semibold mb-1 relative z-10">Add Funds to Balance</h3>
                                    <p className="text-white/70 text-xs mb-6 relative z-10">Pre-fund your account for faster checkouts and auto-renewals.</p>
                                    <button onClick={() => navigate('/billing')} className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-colors relative z-10">
                                        Add Balance
                                    </button>
                                </div>
                            </div>
                            
                            {/* Footer Spacing padding */}
                            <div className="h-8" />
                        </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
