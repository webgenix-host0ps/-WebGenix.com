import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { billingService } from '../../services/billing.service';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
    FileText, Download, Eye, Clock, 
    Search, RefreshCw, ChevronRight, 
    ChevronDown, CreditCard, TrendingUp, AlertTriangle
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

export default function InvoicesList() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [allInvoices, setAllInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await billingService.getInvoices();
            setAllInvoices(response.data || []);
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
            setAllInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    // Stats Calculation
    const stats = useMemo(() => {
        let totalUnpaid = 0;
        let totalPaid = 0;
        let overdueCount = 0;
        
        allInvoices.forEach(inv => {
            if (inv.status === 'unpaid') totalUnpaid += inv.total || 0;
            if (inv.status === 'paid') totalPaid += inv.total || 0;
            if (inv.status === 'overdue') overdueCount++;
        });

        return { totalUnpaid, totalPaid, overdueCount, totalCount: allInvoices.length };
    }, [allInvoices]);

    // Filtering & Sorting
    const filteredInvoices = useMemo(() => {
        let result = allInvoices;

        if (statusFilter !== 'all') {
            result = result.filter(inv => inv.status === statusFilter);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(inv => 
                inv.invoiceNumber?.toLowerCase().includes(q) || 
                inv.items?.some(item => item.description?.toLowerCase().includes(q))
            );
        }

        result = [...result].sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            if (sortBy === 'amount') return (b.total || 0) - (a.total || 0);
            if (sortBy === 'due') return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
            return 0;
        });

        return result;
    }, [allInvoices, statusFilter, searchQuery, sortBy]);

    const getStatusStyle = (status) => {
        switch(status) {
            case 'paid': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'unpaid': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'overdue': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
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
                            <span className="text-accent">Financial Records</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
                            Billing Statements
                        </h1>
                        <p className="text-text-secondary text-sm md:text-base max-w-xl leading-relaxed">
                            Monitor your infrastructure expenditure and manage pending invoices. Execute secure payments and access historical statements.
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <button className="px-8 py-4 rounded-2xl bg-accent hover:bg-accent-hover text-white text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-accent/20 hover:-translate-y-1 active:scale-95 flex items-center gap-2">
                            <CreditCard size={16} /> Add Balance
                        </button>
                    </div>
                </div>

                {/* Financial Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Invoices', value: stats.totalCount, icon: FileText, color: 'blue' },
                        { label: 'Awaiting Payment', value: `₹${stats.totalUnpaid.toFixed(0)}`, icon: Clock, color: 'amber' },
                        { label: 'Settled Amount', value: `₹${stats.totalPaid.toFixed(0)}`, icon: TrendingUp, color: 'green' },
                        { label: 'Overdue Alerts', value: stats.overdueCount, icon: AlertTriangle, color: 'red' },
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
                    {/* Status Tabs */}
                    <div className="flex p-1.5 bg-black/40 rounded-2xl w-full xl:w-auto overflow-x-auto custom-scrollbar">
                        {['all', 'unpaid', 'paid', 'overdue'].map((status) => (
                            <button 
                                key={status}
                                onClick={() => setStatusFilter(status)} 
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === status ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text-muted hover:text-white'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full xl:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Invoice # or Description..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-text-muted/50 focus:outline-none focus:border-accent/30 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full xl:w-auto ml-auto">
                        <div className="relative flex-1 xl:flex-none">
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none w-full xl:w-48 bg-white/[0.03] border border-white/[0.06] rounded-2xl pl-5 pr-10 py-3 text-xs font-bold text-text-secondary hover:text-white transition-all cursor-pointer focus:outline-none focus:border-accent/30"
                            >
                                <option value="newest">Sort by Newest</option>
                                <option value="amount">Highest Amount</option>
                                <option value="due">Due Date</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                        </div>
                        <button onClick={fetchInvoices} className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-text-muted hover:text-white transition-all group">
                            <RefreshCw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                        </button>
                    </div>
                </div>

                {/* Invoices Interface */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-[40px] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/[0.03] border-b border-white/[0.04]">
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Reference</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Deployment Item</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Allocation</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Maturity</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Command</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {loading && allInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-24 text-center">
                                            <RefreshCw className="w-10 h-10 text-accent animate-spin mx-auto mb-6 opacity-50" />
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Scanning Financial Ledger...</p>
                                        </td>
                                    </tr>
                                ) : filteredInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-24 text-center">
                                            <FileText className="w-12 h-12 text-text-muted mx-auto mb-6 opacity-20" />
                                            <p className="text-text-secondary text-sm font-bold uppercase tracking-widest opacity-50">No Statements Found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInvoices.map((invoice) => (
                                        <tr key={invoice._id} className="hover:bg-white/[0.01] transition-colors group">
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-mono font-black text-white group-hover:text-accent transition-colors">
                                                    {invoice.invoiceNumber}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="max-w-[240px]">
                                                    <p className="text-sm text-text-secondary truncate font-black group-hover:text-white transition-colors">
                                                        {invoice.items?.[0]?.description || 'Infrastructure Cycle Renewal'}
                                                    </p>
                                                    {invoice.items?.length > 1 && (
                                                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1 opacity-50">+{invoice.items.length - 1} Nested Items</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-black text-white">
                                                    ₹{invoice.total?.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(invoice.status)}`}>
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm text-text-secondary font-bold">
                                                    {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <Link to={`/invoices/${invoice._id}`} className="p-3 bg-white/[0.03] hover:bg-accent/10 border border-white/[0.06] text-text-muted hover:text-accent rounded-xl transition-all inline-flex" title="View Statement">
                                                        <Eye size={16} />
                                                    </Link>
                                                    <Link to={`/invoices/${invoice._id}?download=true`} className="p-3 bg-white/[0.03] hover:bg-green-500/10 border border-white/[0.06] text-text-muted hover:text-green-400 rounded-xl transition-all inline-flex" title="Export PDF">
                                                        <Download size={16} />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="h-10" />
            </div>
        </DashboardLayout>
    );
}