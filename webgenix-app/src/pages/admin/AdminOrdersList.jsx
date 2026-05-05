import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DataTable from '../../components/dashboard/DataTable';
import FilterBar from '../../components/dashboard/FilterBar';
import StatusBadge from '../../components/dashboard/StatusBadge';
import { adminService } from '../../services/admin.service';
import { Package, Eye, ExternalLink } from 'lucide-react';

export default function AdminOrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await adminService.getOrders({ status: statusFilter, search });
      // Handle both old and new API response structure
      setOrders(response.data?.orders || response.data || []);
    } catch (error) {
      console.error(error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <div className="w-2 h-2 rounded-full bg-green-500"></div>;
      case 'pending':
      case 'processing': return <div className="w-2 h-2 rounded-full bg-amber-500"></div>;
      case 'cancelled':
      case 'fraud': return <div className="w-2 h-2 rounded-full bg-red-500"></div>;
      default: return <div className="w-2 h-2 rounded-full bg-gray-500"></div>;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pending':
      case 'processing': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'cancelled':
      case 'fraud': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const columns = [
    { 
      key: 'orderNumber', 
      header: 'Order #', 
      sortable: true,
      renderCell: (r) => (
        <span className="font-mono font-bold text-white">{r.orderNumber}</span>
      )
    },
    { 
      key: 'client', 
      header: 'Client', 
      renderCell: (r) => (
        <span className="text-text-muted font-medium">{r.userId?.name || r.client?.name || 'N/A'}</span>
      )
    },
    { 
      key: 'items', 
      header: 'Products', 
      renderCell: (r) => (
        <div className="max-w-[200px]">
          {r.items?.map((item, i) => (
            <p key={i} className="text-sm text-white truncate">{item.productName}</p>
          ))}
        </div>
      )
    },
    { 
      key: 'total', 
      header: 'Amount', 
      sortable: true,
      renderCell: (r) => <span className="font-bold text-white">₹{(r.total || 0).toFixed(2)}</span>
    },
    { 
      key: 'status', 
      header: 'Status',
      renderCell: (r) => (
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(r.status)}`}>
          {getStatusIcon(r.status)}
          {r.status?.charAt(0).toUpperCase() + r.status?.slice(1)}
        </span>
      )
    },
    { 
      key: 'createdAt', 
      header: 'Date', 
      sortable: true,
      renderCell: (r) => new Date(r.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      })
    },
    {
      key: 'actions',
      header: 'Actions',
      renderCell: (r) => (
        <div className="flex gap-2">
          <Link 
            to={`/invoices/${r.invoiceId?._id || r.invoiceId}`}
            className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
            title="View Invoice"
          >
            <Eye className="w-4 h-4 text-text-muted" />
          </Link>
          {r.invoiceId && (
            <Link 
              to={`/invoices/${r.invoiceId?._id || r.invoiceId}`}
              className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
              title="View Invoice"
            >
              <ExternalLink className="w-4 h-4 text-text-muted" />
            </Link>
          )}
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-[32px] animate-in fade-in duration-700">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Package size={16} className="text-accent" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Order Matrix</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">Order Management</h1>
            <p className="text-text-secondary text-sm font-bold uppercase tracking-widest opacity-60 mt-2">Monitor and process all client service orders and transactions.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Orders', value: orders.length, icon: Package, color: 'blue' },
            { label: 'Pending', value: orders.filter(o => o.status === 'pending' || o.status === 'processing').length, icon: Package, color: 'amber' },
            { label: 'Completed', value: orders.filter(o => o.status === 'completed').length, icon: Package, color: 'green' },
            { label: 'Cancelled', value: orders.filter(o => o.status === 'cancelled' || o.status === 'fraud').length, icon: Package, color: 'red' },
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

        {/* Table Area */}
        <div className="bg-dark-900/50 border border-header-border rounded-[40px] p-2 overflow-hidden shadow-2xl">
          <FilterBar 
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search orders by number or client..."
            filters={[
              {
                key: 'status',
                label: 'All Statuses',
                value: statusFilter,
                options: [
                  { label: 'Pending', value: 'pending' },
                  { label: 'Processing', value: 'processing' },
                  { label: 'Completed', value: 'completed' },
                  { label: 'Cancelled', value: 'cancelled' }
                ]
              }
            ]}
            onFilterChange={(key, val) => {
              if (key === 'status') setStatusFilter(val);
            }}
          />
          
          <DataTable 
            columns={columns} 
            data={orders} 
            isLoading={loading} 
          />
        </div>

        <div className="h-10" />
      </div>
    </DashboardLayout>
  );
}
