import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { billingService } from '../../services/billing.service';
import { getTickets } from '../../services/ticket.service';
import { 
    Server, Ticket, CreditCard, 
    ChevronRight, Zap, Activity, Shield, RefreshCw,
    ShoppingBag
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

export default function ClientDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        activeServices: 0,
        pendingInvoices: 0,
        activeTickets: 0,
        totalSpent: 0
    });
    const [recentServices, setRecentServices] = useState([]);
    const [recentTickets, setRecentTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [servicesRes, ticketsRes, billingRes] = await Promise.all([
                billingService.getMyServices(),
                getTickets({ limit: 5 }),
                billingService.getInvoices()
            ]);

            const services = servicesRes.data?.services || servicesRes.data || [];
            const tickets = ticketsRes.data || [];
            const invoices = billingRes.data || [];

            setStats({
                activeServices: services.filter(s => s.status === 'active').length,
                pendingInvoices: invoices.filter(i => i.status === 'unpaid').length,
                activeTickets: tickets.filter(t => !['RESOLVED', 'CLOSED'].includes(t.status?.toUpperCase())).length,
                totalSpent: invoices.reduce((acc, curr) => acc + (curr.status === 'paid' ? curr.total : 0), 0)
            });

            setRecentServices(services.slice(0, 3));
            setRecentTickets(tickets.slice(0, 3));
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const metricCards = [
        { label: 'Active Services', value: stats.activeServices, icon: Server, color: 'blue', trend: '+12%' },
        { label: 'Unpaid Invoices', value: stats.pendingInvoices, icon: CreditCard, color: 'amber', trend: 'Attention' },
        { label: 'Open Tickets', value: stats.activeTickets, icon: Ticket, color: 'purple', trend: 'Support' },
        { label: 'Total Spending', value: `₹${stats.totalSpent.toFixed(0)}`, icon: Zap, color: 'green', trend: 'Account' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-[32px] animate-in fade-in duration-700">
                
                {/* Hero Section */}
                <div className="relative p-8 lg:p-12 rounded-[40px] bg-gradient-to-br from-accent/20 via-accent/5 to-transparent border border-white/[0.08] overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-green-400">System Online</span>
                            </div>
                            <h1 className="text-4xl lg:text-6xl font-black text-text-primary tracking-tighter mb-4 leading-tight">
                                Welcome back,<br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary">{user?.name?.split(' ')[0]}</span>
                            </h1>
                            <p className="text-text-secondary text-sm md:text-base max-w-xl leading-relaxed font-medium">
                                Your services are running smoothly. All systems are currently <span className="text-white font-bold">active and secure</span>.
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-4">
                            <button onClick={() => navigate('/marketplace')} className="px-8 py-4 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-2xl shadow-white/10 active:scale-95">
                                Add Service
                            </button>
                            <button onClick={() => navigate('/tickets/new')} className="px-8 py-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs font-black uppercase tracking-widest transition-all backdrop-blur-md">
                                Get Support
                            </button>
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metricCards.map((card, i) => (
                        <div key={i} className="bg-white/[0.03] border border-white/[0.06] p-7 rounded-[32px] group hover:border-accent/30 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/5">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`w-12 h-12 rounded-2xl bg-${card.color}-500/10 border border-${card.color}-500/20 flex items-center justify-center text-${card.color}-400 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-${card.color}-500/10`}>
                                    <card.icon size={22} />
                                </div>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg bg-${card.color}-500/10 text-${card.color}-400 border border-${card.color}-500/20`}>
                                    {card.trend}
                                </span>
                            </div>
                            <h3 className="text-3xl font-black text-white mb-1 tracking-tight group-hover:translate-x-1 transition-transform">{card.value}</h3>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em] opacity-60">{card.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Active Infrastructure */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <Activity size={20} className="text-accent" />
                                <h2 className="text-xl font-black text-white tracking-tight uppercase">My Services</h2>
                            </div>
                            <Link to="/my-services" className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline">View All</Link>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="h-24 bg-white/[0.02] border border-white/[0.05] rounded-[28px] animate-pulse"></div>
                                ))
                            ) : recentServices.length === 0 ? (
                                <div className="py-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[40px] group hover:border-accent/30 transition-all">
                                    <Server size={40} className="text-text-muted mx-auto mb-4 opacity-20" />
                                    <p className="text-text-secondary text-sm font-bold uppercase tracking-widest">No Active Services</p>
                                    <button onClick={() => navigate('/marketplace')} className="mt-4 text-accent text-xs font-black uppercase hover:underline">Browse Marketplace</button>
                                </div>
                            ) : (
                                recentServices.map((service, i) => (
                                    <div key={i} className="group flex items-center justify-between p-6 bg-white/[0.02] border border-white/[0.06] hover:border-accent/40 rounded-[28px] transition-all duration-500 hover:shadow-xl hover:shadow-accent/5">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:rotate-12 transition-transform">
                                                <Server size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-white text-base mb-1 group-hover:text-accent transition-colors">{service.productName}</h4>
                                                <p className="text-xs text-text-muted font-bold uppercase tracking-widest opacity-60">{service.domain || 'Active Plan'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="hidden md:block text-right">
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Status</p>
                                                <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase border ${service.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                    {service.status}
                                                </span>
                                            </div>
                                            <ChevronRight size={18} className="text-text-muted group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Support & Alerts */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <Shield size={20} className="text-purple-400" />
                                <h2 className="text-xl font-black text-white tracking-tight uppercase">Support</h2>
                            </div>
                            <Link to="/tickets" className="text-[10px] font-black text-purple-400 uppercase tracking-widest hover:underline">View All</Link>
                        </div>

                        <div className="bg-dark-800 border border-header-border rounded-[32px] p-2 overflow-hidden shadow-2xl">
                            {loading ? (
                                <div className="p-8 text-center animate-pulse">
                                    <RefreshCw className="mx-auto text-accent animate-spin mb-4" />
                                    <p className="text-xs font-black text-text-muted uppercase tracking-widest">Loading Support...</p>
                                </div>
                            ) : recentTickets.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Ticket size={32} className="text-text-muted mx-auto mb-4 opacity-10" />
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-relaxed">No active support<br />tickets found</p>
                                </div>
                            ) : (
                                recentTickets.map((ticket, i) => (
                                    <div key={i} className="p-5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-all cursor-pointer group">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-black text-accent uppercase tracking-widest">#{ticket.ticketId}</span>
                                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-40">Active</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-white mb-2 line-clamp-1 group-hover:text-accent transition-colors">{ticket.subject}</h4>
                                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${ticket.status === 'OPEN' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                            {ticket.status}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Promo / Banner Card */}
                        <div className="relative p-7 rounded-[32px] bg-gradient-to-br from-indigo-600 to-purple-700 overflow-hidden shadow-2xl shadow-indigo-500/20 group">
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                            <ShoppingBag className="text-white/40 mb-4" size={28} />
                            <h4 className="text-white font-black text-lg mb-2">Upgrade Your Plan</h4>
                            <p className="text-white/70 text-xs font-bold leading-relaxed mb-6 italic">Unlock premium features and save up to 25% on annual billing plans.</p>
                            <button onClick={() => navigate('/marketplace')} className="w-full py-3.5 rounded-2xl bg-white text-indigo-700 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-100 transition-all shadow-xl">
                                Browse Deals
                            </button>
                        </div>
                    </div>
                </div>

                <div className="h-10" />
            </div>
        </DashboardLayout>
    );
}
