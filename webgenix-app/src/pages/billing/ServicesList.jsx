import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
    Server, Globe, Shield, ExternalLink, RefreshCw, Search, 
    AlertCircle, CheckCircle, Clock, XCircle, ChevronRight, 
    ShoppingBag, ChevronDown, Activity, Zap, TrendingUp
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

export default function ServicesList() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [allServices, setAllServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await api.get('/billing/services');
            setAllServices(response.data?.data?.services || response.data?.data || []);
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

    // Calculate stats
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

    // Filter & Sort
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
                const dateA = a.nextDueDate ? new Date(a.nextDueDate).getTime() : Infinity;
                const dateB = b.nextDueDate ? new Date(b.nextDueDate).getTime() : Infinity;
                return dateA - dateB;
            }
            if (sortBy === 'name') {
                return (a.productName || '').localeCompare(b.productName || '');
            }
            return 0;
        });

        return result;
    }, [allServices, statusFilter, searchQuery, sortBy]);

    // UI Helpers
    const getStatusIcon = (status) => {
        switch(status) {
            case 'active': return <CheckCircle className="w-3 h-3" />;
            case 'pending': return <Clock className="w-3 h-3" />;
            case 'suspended': return <AlertCircle className="w-3 h-3" />;
            default: return <Server className="w-3 h-3" />;
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
        if (n.includes('ssl') || n.includes('security')) return <Shield className="w-6 h-6 text-green-400" />;
        return <Server className="w-6 h-6 text-blue-400" />;
    };

    const getServiceIconBg = (name) => {
        const n = (name || '').toLowerCase();
        if (n.includes('domain')) return 'from-amber-500/20 to-orange-500/20';
        if (n.includes('ssl') || n.includes('security')) return 'from-green-500/20 to-emerald-500/20';
        return 'from-blue-500/20 to-indigo-500/20';
    };

    return (
        <DashboardLayout>
            <div className="space-y-[32px] animate-in fade-in duration-700">
                
                {/* Page Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-text-muted mb-4 opacity-60">
                            <Link to="/dashboard" className="hover:text-white transition-colors">Workspace</Link>
                            <ChevronRight size={12} />
                            <span className="text-accent">Infrastructure Node</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-4">
                            My Services
                        </h1>
                        <p className="text-text-secondary text-sm md:text-base max-w-xl leading-relaxed">
                            Monitor and manage your active infrastructure nodes, service subscriptions, and domain assets from a central terminal.
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4">
                        <button onClick={() => navigate('/dashboard/marketplace')} className="px-6 py-4 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all flex items-center gap-3">
                            <ShoppingBag size={16} /> Marketplace
                        </button>
                        <button className="px-8 py-4 bg-accent hover:bg-accent-hover text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-accent/20 flex items-center gap-3">
                            <RefreshCw size={16} /> Renew Synchronizer
                        </button>
                    </div>
                </div>

                {/* Summary Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Active Nodes', value: stats.active, icon: CheckCircle, color: 'green' },
                        { label: 'Pending Signals', value: stats.pending, icon: Clock, color: 'amber' },
                        { label: 'Suspended Ops', value: stats.suspended, icon: AlertCircle, color: 'red' },
                        { label: 'Expiring Cycles', value: stats.expiringSoon, icon: TrendingUp, color: 'blue' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white/[0.03] border border-white/[0.06] p-8 rounded-[32px] group hover:border-accent/30 transition-all duration-500">
                            <div className={`w-12 h-12 rounded-2xl bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center mb-6 text-${item.color}-400 group-hover:scale-110 transition-transform`}>
                                <item.icon size={24} />
                            </div>
                            <h3 className="text-4xl font-black text-white mb-1 tracking-tight">{item.value}</h3>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-50">{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-[32px] flex flex-col xl:flex-row items-center gap-4">
                    {/* Search */}
                    <div className="relative w-full xl:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Identify node..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-text-muted/50 focus:outline-none focus:border-accent/30 transition-all"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex p-1.5 bg-black/40 rounded-2xl w-full xl:w-auto overflow-x-auto no-scrollbar">
                        {['all', 'active', 'pending', 'suspended'].map(status => (
                            <button 
                                key={status}
                                onClick={() => setStatusFilter(status)} 
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === status ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text-muted hover:text-white'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 w-full xl:w-auto ml-auto">
                        <div className="relative flex-1 xl:flex-none">
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full xl:w-60 bg-white/[0.03] border border-white/[0.06] rounded-2xl pl-4 pr-10 py-3 text-[10px] font-black uppercase tracking-widest text-white appearance-none focus:outline-none focus:border-accent/30 transition-all cursor-pointer"
                            >
                                <option value="newest" className="bg-dark-800">Sequence: Newest</option>
                                <option value="renewal" className="bg-dark-800">Sequence: Renewal</option>
                                <option value="name" className="bg-dark-800">Sequence: Identity</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                        </div>
                        <button onClick={fetchServices} className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-text-secondary hover:text-white transition-all hover:bg-white/[0.08]" title="Refresh Terminal">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Alert Strip */}
                {stats.expiringSoon > 0 && (
                    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-[28px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse-slow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                                <Zap size={22} />
                            </div>
                            <div>
                                <p className="text-sm text-white font-black uppercase tracking-widest mb-1">Renewal Signal Detected</p>
                                <p className="text-xs text-amber-200/60 font-bold uppercase tracking-widest">{stats.expiringSoon} Infrastructure nodes reaching end of cycle.</p>
                            </div>
                        </div>
                        <button className="w-full md:w-auto px-8 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                            Synchronize Payments
                        </button>
                    </div>
                )}

                {/* Services List */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="text-center py-20 bg-white/[0.02] border border-white/[0.06] rounded-[32px]">
                            <RefreshCw className="w-10 h-10 text-accent animate-spin mx-auto mb-4" />
                            <p className="text-text-secondary font-bold uppercase tracking-widest text-[10px]">Accessing infrastructure logs...</p>
                        </div>
                    ) : filteredServices.length === 0 ? (
                        <div className="text-center py-24 bg-white/[0.01] border border-white/[0.06] border-dashed rounded-[40px]">
                            <Server className="w-16 h-16 text-text-muted mx-auto mb-6 opacity-20" />
                            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Zero Node Activity</h3>
                            <p className="text-text-secondary mb-10 font-bold uppercase tracking-widest text-[10px] opacity-60">No service signals matching current synchronization parameters.</p>
                            <button onClick={() => navigate('/dashboard/marketplace')} className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-accent hover:text-white transition-all">
                                Deploy New Infrastructure
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {filteredServices.map(service => {
                                const isExpiring = service.nextDueDate && new Date(service.nextDueDate) <= new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
                                
                                return (
                                    <div key={service._id} className="group flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-white/[0.02] border border-white/[0.06] hover:border-accent/30 rounded-[32px] p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/5">
                                        
                                        {/* Left Zone: Service Identity */}
                                        <div className="flex items-center gap-6 xl:w-[35%]">
                                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getServiceIconBg(service.productName)} border border-white/5 flex items-center justify-center shadow-inner flex-shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                                                {getServiceIcon(service.productName)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-black text-white truncate">{service.productName}</h3>
                                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${getStatusStyle(service.status)}`}>
                                                        {getStatusIcon(service.status)} {service.status}
                                                    </span>
                                                </div>
                                                {service.domain && (
                                                    <p className="text-xs text-text-muted font-bold tracking-widest truncate flex items-center gap-2 opacity-60">
                                                        <Globe size={14} className="text-accent" />
                                                        {service.domain}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Center Zone: Metadata Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 xl:w-[45%] py-6 xl:py-0 border-y xl:border-y-0 xl:border-x border-white/5 xl:px-8">
                                            <div>
                                                <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-black mb-2 opacity-40">Cycle</p>
                                                <p className="text-sm font-black text-white uppercase tracking-widest">{service.cycle}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-black mb-2 opacity-40">Load Cost</p>
                                                <p className="text-lg font-black text-white tracking-tight">₹{service.recurringAmount || 0}</p>
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-black mb-2 opacity-40">Cycle End</p>
                                                {service.nextDueDate ? (
                                                    <div className="flex items-center gap-2">
                                                        <p className={`text-sm font-black uppercase tracking-widest ${isExpiring ? 'text-amber-400' : 'text-white'}`}>
                                                            {new Date(service.nextDueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-text-muted font-black opacity-30">N/A</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Zone: Actions */}
                                        <div className="flex flex-col sm:flex-row xl:flex-col gap-3 xl:w-[20%]">
                                            <button className="flex-1 px-8 py-3.5 bg-accent hover:bg-accent-hover text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-accent/20">
                                                Access Node
                                            </button>
                                            <button className="flex-1 px-8 py-3.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.05] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
                                                Refactor
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="h-10" />
            </div>
        </DashboardLayout>
    );
}