import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { billingService } from '../../services/billing.service';
import { 
    Server, Globe, Shield, ExternalLink, RefreshCw, Search, 
    AlertCircle, CheckCircle, Clock, XCircle, ChevronRight, 
    ShoppingBag, ChevronDown
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

export default function MyServices() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [allServices, setAllServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await billingService.getMyServices();
            setAllServices(response.data?.services || response.data || []);
        } catch (error) {
            console.error('Failed to fetch services:', error);
            setAllServices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    useEffect(() => {
        if (searchParams.get('refresh') === 'true') {
            setTimeout(() => fetchServices(), 1500);
        }
    }, [searchParams]);

    const stats = useMemo(() => {
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        let active = 0;
        let pending = 0;
        let suspended = 0;
        let expiringSoon = 0;

        allServices.forEach(s => {
            if (s.status === 'active') active++;
            if (s.status === 'pending') pending++;
            if (s.status === 'suspended') suspended++;
            
            if (s.nextDueDate && s.status === 'active') {
                const dueDate = new Date(s.nextDueDate);
                if (dueDate <= thirtyDaysFromNow && dueDate >= now) {
                    expiringSoon++;
                }
            }
        });

        return { total: allServices.length, active, pending, suspended, expiringSoon };
    }, [allServices]);

    const filteredServices = useMemo(() => {
        let result = allServices;

        if (statusFilter !== 'all') {
            result = result.filter(s => s.status === statusFilter);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s => 
                s.productName?.toLowerCase().includes(q) || 
                s.domain?.toLowerCase().includes(q)
            );
        }

        result = [...result].sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            }
            if (sortBy === 'renewal') {
                if (!a.nextDueDate) return 1;
                if (!b.nextDueDate) return -1;
                return new Date(a.nextDueDate) - new Date(b.nextDueDate);
            }
            if (sortBy === 'name') {
                return (a.productName || '').localeCompare(b.productName || '');
            }
            return 0;
        });

        return result;
    }, [allServices, statusFilter, searchQuery, sortBy]);

    const getStatusIcon = (status) => {
        switch(status) {
            case 'active': return <CheckCircle className="w-3.5 h-3.5" />;
            case 'pending': return <Clock className="w-3.5 h-3.5" />;
            case 'suspended': return <AlertCircle className="w-3.5 h-3.5" />;
            case 'cancelled':
            case 'terminated': return <XCircle className="w-3.5 h-3.5" />;
            default: return <Server className="w-3.5 h-3.5" />;
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'active': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'suspended': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const getServiceIcon = (name) => {
        const n = (name || '').toLowerCase();
        if (n.includes('domain')) return <Globe className="w-6 h-6 text-amber-400" />;
        if (n.includes('ssl') || n.includes('security') || n.includes('guard')) return <Shield className="w-6 h-6 text-green-400" />;
        return <Server className="w-6 h-6 text-blue-400" />;
    };

    const getServiceIconBg = (name) => {
        const n = (name || '').toLowerCase();
        if (n.includes('domain')) return 'from-amber-500/20 to-orange-500/20';
        if (n.includes('ssl') || n.includes('security') || n.includes('guard')) return 'from-green-500/20 to-emerald-500/20';
        return 'from-blue-500/20 to-indigo-500/20';
    };

    return (
        <DashboardLayout>
            <div className="space-y-[32px] animate-in fade-in duration-700">
                
                {/* Page Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-text-muted mb-4 opacity-60">
                            <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                            <ChevronRight size={12} />
                            <span className="text-accent">Services</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
                            My Services
                        </h1>
                        <p className="text-text-secondary text-sm md:text-base max-w-xl leading-relaxed">
                            View and manage all your active hosting plans, domains, and security services in one place.
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <button onClick={() => navigate('/marketplace')} className="px-8 py-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2">
                            <ShoppingBag size={16} /> Add Service
                        </button>
                        <button className="px-8 py-4 rounded-2xl bg-accent hover:bg-accent-hover text-white text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-accent/20 hover:-translate-y-1 active:scale-95 flex items-center gap-2">
                            <RefreshCw size={16} /> Refresh
                        </button>
                    </div>
                </div>

                {/* Summary Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Items', value: stats.total, icon: Server, color: 'blue' },
                        { label: 'Active Plans', value: stats.active, icon: CheckCircle, color: 'green' },
                        { label: 'Processing', value: stats.pending, icon: Clock, color: 'amber' },
                        { label: 'Expiring Soon', value: stats.expiringSoon, icon: AlertCircle, color: 'red' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white/[0.03] border border-white/[0.06] p-6 rounded-[28px] group hover:border-accent/30 transition-all duration-300">
                            <div className={`w-10 h-10 rounded-xl bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center mb-4 text-${item.color}-400 group-hover:scale-110 transition-transform`}>
                                <item.icon size={20} />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-1 tracking-tight">{item.value}</h3>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-[28px] flex flex-col xl:flex-row items-center gap-4">
                    {/* Search */}
                    <div className="relative w-full xl:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search by name or domain..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-text-muted/50 focus:outline-none focus:border-accent/30 transition-all"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex p-1.5 bg-black/40 rounded-2xl w-full xl:w-auto overflow-x-auto custom-scrollbar">
                        {['all', 'active', 'pending', 'suspended'].map((status) => (
                            <button 
                                key={status}
                                onClick={() => setStatusFilter(status)} 
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${statusFilter === status ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text-muted hover:text-white'}`}
                            >
                                {status} <span className="bg-white/10 px-1.5 py-0.5 rounded text-[8px]">{status === 'all' ? stats.total : stats[status] || 0}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 w-full xl:w-auto ml-auto">
                        <div className="relative flex-1 xl:flex-none">
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none w-full xl:w-48 bg-white/[0.03] border border-white/[0.06] rounded-2xl pl-5 pr-10 py-3 text-xs font-bold text-text-secondary hover:text-white transition-all cursor-pointer focus:outline-none focus:border-accent/30"
                            >
                                <option value="newest">Sort by Newest</option>
                                <option value="renewal">Sort by Renewal</option>
                                <option value="name">Sort by Name</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                        </div>
                        <button onClick={fetchServices} className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-text-muted hover:text-white transition-all group">
                            <RefreshCw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                        </button>
                    </div>
                </div>

                {/* Services List */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="py-32 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-[40px]">
                            <RefreshCw size={40} className="text-accent animate-spin mx-auto mb-6 opacity-50" />
                            <p className="text-text-muted font-bold uppercase tracking-widest text-xs">Loading Services...</p>
                        </div>
                    ) : filteredServices.length === 0 ? (
                        <div className="py-32 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-[40px]">
                            <Server size={48} className="text-text-muted mx-auto mb-6 opacity-20" />
                            <h3 className="text-xl font-bold text-white mb-2">No active services</h3>
                            <p className="text-text-secondary text-sm max-w-md mx-auto mb-8">You don't have any services yet. Order your first one from our marketplace.</p>
                            <button onClick={() => navigate('/marketplace')} className="px-8 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Order First Service</button>
                        </div>
                    ) : (
                        filteredServices.map(service => {
                            const isExpiring = service.nextDueDate && new Date(service.nextDueDate) <= new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
                            
                            return (
                                <div key={service._id} className="group flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white/[0.02] border border-white/[0.06] hover:border-accent/40 rounded-[32px] p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/5">
                                    
                                    <div className="flex items-center gap-6 xl:w-[35%]">
                                        <div className={`w-16 h-16 rounded-[22px] bg-gradient-to-br ${getServiceIconBg(service.productType || service.productName)} border border-white/[0.05] flex items-center justify-center shadow-2xl flex-shrink-0 group-hover:scale-110 transition-all duration-500`}>
                                            {getServiceIcon(service.productType || service.productName)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-black text-white truncate group-hover:text-accent transition-colors">{service.productName}</h3>
                                                <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${getStatusStyle(service.status)}`}>
                                                    {getStatusIcon(service.status)} {service.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-text-muted font-medium truncate flex items-center gap-2">
                                                <Globe size={14} className="opacity-50" />
                                                {service.domain || 'Active Plan'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 xl:w-[45%] py-6 xl:py-0 border-y xl:border-y-0 xl:border-x border-white/[0.04] xl:px-8">
                                        <div>
                                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-2 opacity-50">Cycle</p>
                                            <p className="text-sm font-bold text-white capitalize">{service.cycle || 'Monthly'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-2 opacity-50">Pricing</p>
                                            <p className="text-sm font-black text-white">₹{service.recurringAmount?.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-2 opacity-50">Due Date</p>
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm font-bold ${isExpiring ? 'text-amber-400' : 'text-white'}`}>
                                                    {service.nextDueDate ? new Date(service.nextDueDate).toLocaleDateString() : '-'}
                                                </p>
                                                {isExpiring && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row xl:flex-col justify-end xl:justify-center gap-3 xl:w-[20%]">
                                        <button 
                                            onClick={() => navigate(`/my-services/${service._id}/manage`)}
                                            className="flex-1 xl:flex-none px-6 py-3 bg-accent hover:bg-accent-hover text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-accent/20 text-center"
                                        >
                                            Manage Plan
                                        </button>
                                        <button 
                                            onClick={() => {
                                                navigate(`/my-services/${service._id}`);
                                            }}
                                            className="flex-1 xl:flex-none px-6 py-3 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.05] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all text-center"
                                        >
                                            Renew Now
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="h-10" />
            </div>
        </DashboardLayout>
    );
}
