import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { billingService } from '../../services/billing.service';
import { 
    Server, Globe, Shield, ExternalLink, RefreshCw, Search, 
    AlertCircle, CheckCircle, Clock, XCircle, ChevronRight, 
    ShoppingBag, ChevronDown, Bell, LogOut, LayoutDashboard
} from 'lucide-react';

export default function MyServices() {
    const { user, logout } = useAuth();
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

    // Auto-refresh if redirected from a successful payment
    useEffect(() => {
        if (searchParams.get('refresh') === 'true') {
            setTimeout(() => fetchServices(), 1500);
        }
    }, [searchParams]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

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

    // Filter & Sort for the view
    const filteredServices = useMemo(() => {
        let result = allServices;

        // Status Filter
        if (statusFilter !== 'all') {
            result = result.filter(s => s.status === statusFilter);
        }

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s => 
                s.productName?.toLowerCase().includes(q) || 
                s.domain?.toLowerCase().includes(q)
            );
        }

        // Sort
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

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    // UI Helpers
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
                            <p className="text-xs text-text-muted">Enterprise Account</p>
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

            {/* Main Container - 85% width */}
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
                            <span className="text-accent">My Services</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                            My Services
                        </h1>
                        <p className="text-text-secondary text-sm md:text-base">
                            Manage your active services and subscriptions.
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <button onClick={() => navigate('/dashboard/marketplace')} className="px-5 py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.08)] text-sm font-medium transition-colors flex items-center gap-2 text-white">
                            <ShoppingBag size={16} />
                            Browse Marketplace
                        </button>
                        <button className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover shadow-lg shadow-accent/20 text-white text-sm font-medium transition-all hover:-translate-y-0.5 flex items-center gap-2">
                            <RefreshCw size={16} />
                            Renew All
                        </button>
                    </div>
                </div>

                {/* Summary Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px] mb-[32px]">
                    {/* Card 1: Total */}
                    <div className="bg-[rgba(17,20,28,0.88)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)]">
                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <Server className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1 relative z-10">{stats.total}</h3>
                        <p className="text-text-secondary text-sm font-medium relative z-10">Total Services</p>
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <Server size={80} className="text-blue-500 transform rotate-12 translate-x-6 -translate-y-6" />
                        </div>
                    </div>

                    {/* Card 2: Active */}
                    <div className="bg-[rgba(17,20,28,0.88)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] p-6 rounded-2xl relative overflow-hidden group hover:border-green-500/30 transition-all hover:shadow-[0_8px_30px_rgba(34,197,94,0.1)]">
                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1 relative z-10">{stats.active}</h3>
                        <p className="text-text-secondary text-sm font-medium relative z-10">Active & Running</p>
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <CheckCircle size={80} className="text-green-500 transform rotate-12 translate-x-6 -translate-y-6" />
                        </div>
                    </div>

                    {/* Card 3: Pending */}
                    <div className="bg-[rgba(17,20,28,0.88)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] p-6 rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)]">
                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-amber-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1 relative z-10">{stats.pending}</h3>
                        <p className="text-text-secondary text-sm font-medium relative z-10">Pending Activation</p>
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <Clock size={80} className="text-amber-500 transform rotate-12 translate-x-6 -translate-y-6" />
                        </div>
                    </div>

                    {/* Card 4: Expiring */}
                    <div className="bg-[rgba(17,20,28,0.88)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] p-6 rounded-2xl relative overflow-hidden group hover:border-red-500/30 transition-all hover:shadow-[0_8px_30px_rgba(239,68,68,0.1)]">
                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1 relative z-10">{stats.expiringSoon}</h3>
                        <p className="text-text-secondary text-sm font-medium relative z-10">Expiring &lt; 30 Days</p>
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <AlertCircle size={80} className="text-red-500 transform rotate-12 translate-x-6 -translate-y-6" />
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-[rgba(17,20,28,0.88)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4 mb-[24px]">
                    {/* Search */}
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input 
                            type="text" 
                            placeholder="Search services..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-text-muted focus:outline-none focus:border-accent/50 focus:bg-[rgba(255,255,255,0.05)] transition-all"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex p-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)] rounded-xl w-full md:w-auto overflow-x-auto custom-scrollbar">
                        <button onClick={() => setStatusFilter('all')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${statusFilter === 'all' ? 'bg-[rgba(255,255,255,0.08)] text-white shadow-sm' : 'text-text-secondary hover:text-white hover:bg-[rgba(255,255,255,0.04)]'}`}>
                            All <span className="bg-[rgba(255,255,255,0.1)] px-1.5 py-0.5 rounded text-[10px]">{stats.total}</span>
                        </button>
                        <button onClick={() => setStatusFilter('active')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${statusFilter === 'active' ? 'bg-[rgba(255,255,255,0.08)] text-white shadow-sm' : 'text-text-secondary hover:text-white hover:bg-[rgba(255,255,255,0.04)]'}`}>
                            Active <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded text-[10px]">{stats.active}</span>
                        </button>
                        <button onClick={() => setStatusFilter('pending')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${statusFilter === 'pending' ? 'bg-[rgba(255,255,255,0.08)] text-white shadow-sm' : 'text-text-secondary hover:text-white hover:bg-[rgba(255,255,255,0.04)]'}`}>
                            Pending <span className="bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded text-[10px]">{stats.pending}</span>
                        </button>
                        <button onClick={() => setStatusFilter('suspended')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${statusFilter === 'suspended' ? 'bg-[rgba(255,255,255,0.08)] text-white shadow-sm' : 'text-text-secondary hover:text-white hover:bg-[rgba(255,255,255,0.04)]'}`}>
                            Suspended <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded text-[10px]">{stats.suspended}</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-3 ml-auto w-full md:w-auto">
                        <div className="relative w-full md:w-auto">
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none w-full md:w-48 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl pl-4 pr-10 py-2.5 text-sm text-text-secondary hover:text-white focus:outline-none focus:border-accent/50 cursor-pointer transition-colors"
                            >
                                <option value="newest" className="bg-dark-800 text-white">Sort by Newest</option>
                                <option value="renewal" className="bg-dark-800 text-white">Sort by Renewal Date</option>
                                <option value="name" className="bg-dark-800 text-white">Sort by Service Name</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                        </div>
                        <button onClick={fetchServices} className="p-2.5 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl text-text-secondary hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-colors flex-shrink-0" title="Refresh">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Alert Strip */}
                {stats.expiringSoon > 0 && (
                    <div className="mb-[24px] bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                            <p className="text-sm text-amber-100 font-medium">You have <span className="font-bold">{stats.expiringSoon}</span> service(s) renewing in less than 30 days. To avoid interruption, please ensure your payment method is up to date.</p>
                        </div>
                        <button className="px-4 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-sm font-semibold transition-colors">
                            Review Renewals
                        </button>
                    </div>
                )}

                {/* Services List */}
                <div className="space-y-[24px]">
                    {loading ? (
                        <div className="text-center py-20 bg-[rgba(17,20,28,0.88)] border border-[rgba(255,255,255,0.04)] rounded-2xl">
                            <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
                            <p className="text-text-secondary font-medium">Loading your services...</p>
                        </div>
                    ) : filteredServices.length === 0 ? (
                        <div className="text-center py-20 bg-[rgba(17,20,28,0.88)] border border-[rgba(255,255,255,0.04)] border-dashed rounded-2xl">
                            <Server className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold text-white mb-2">No services found</h3>
                            <p className="text-text-secondary mb-6">You don't have any services matching the current filters.</p>
                            <button onClick={() => navigate('/dashboard/marketplace')} className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-colors">
                                Browse Marketplace
                            </button>
                        </div>
                    ) : (
                        filteredServices.map(service => {
                            const isExpiring = service.nextDueDate && new Date(service.nextDueDate) <= new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
                            
                            return (
                                <div key={service._id} className="group flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-[rgba(17,20,28,0.88)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] hover:border-accent/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5">
                                    
                                    {/* Left Zone: Service Identity */}
                                    <div className="flex items-center gap-5 xl:w-[35%]">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getServiceIconBg(service.productType || service.productName)} border border-[rgba(255,255,255,0.05)] flex items-center justify-center shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform`}>
                                            {getServiceIcon(service.productType || service.productName)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-bold text-white truncate">{service.productName}</h3>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${getStatusStyle(service.status)}`}>
                                                    {getStatusIcon(service.status)} {service.status}
                                                </span>
                                            </div>
                                            {service.domain ? (
                                                <p className="text-sm text-text-secondary truncate flex items-center gap-1.5">
                                                    <ExternalLink size={14} className="text-text-muted" />
                                                    {service.domain}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-text-secondary truncate flex items-center gap-1.5 capitalize">
                                                    {service.productType || 'addon'}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Center Zone: Metadata Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 xl:w-[45%] py-4 xl:py-0 border-y xl:border-y-0 xl:border-x border-[rgba(255,255,255,0.04)] xl:px-6">
                                        <div>
                                            <p className="text-[11px] text-text-muted uppercase tracking-wider font-semibold mb-1">Billing Cycle</p>
                                            <p className="text-sm font-medium text-white capitalize">{service.cycle || 'Monthly'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-text-muted uppercase tracking-wider font-semibold mb-1">Price</p>
                                            <p className="text-sm font-bold text-white">₹{service.recurringAmount?.toFixed(2) || '0.00'}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-[11px] text-text-muted uppercase tracking-wider font-semibold mb-1">Next Due Date</p>
                                            {service.nextDueDate ? (
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-sm font-medium ${isExpiring ? 'text-amber-400' : 'text-white'}`}>
                                                        {new Date(service.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                    {isExpiring && (
                                                        <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded font-bold">Due Soon</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-text-secondary">-</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Zone: Actions */}
                                    <div className="flex flex-row xl:flex-col justify-end xl:justify-center gap-2 xl:w-[20%]">
                                        <button className="flex-1 xl:flex-none px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-accent/20 text-center">
                                            Manage Service
                                        </button>
                                        <div className="flex gap-2 w-full xl:w-auto">
                                            <button className="flex-1 px-4 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.05)] text-white text-sm font-medium rounded-xl transition-all text-center">
                                                Renew
                                            </button>
                                            <button className="flex-1 px-4 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.05)] text-white text-sm font-medium rounded-xl transition-all text-center">
                                                Upgrade
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
}
