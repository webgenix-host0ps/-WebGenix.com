import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { billingService } from '../../services/billing.service';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DataTable from '../../components/dashboard/DataTable';
import FilterBar from '../../components/dashboard/FilterBar';
import { Package, Eye, X, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await billingService.getOrders({ status: statusFilter });
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'pending':
      case 'processing': return <Clock className="w-4 h-4 text-warning" />;
      case 'cancelled':
      case 'fraud': return <XCircle className="w-4 h-4 text-error" />;
      default: return <AlertCircle className="w-4 h-4 text-text-muted" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-success/20 text-success';
      case 'pending':
      case 'processing': return 'bg-warning/20 text-warning';
      case 'cancelled':
      case 'fraud': return 'bg-error/20 text-error';
      default: return 'bg-dark-600 text-text-secondary';
    }
  };

  const columns = [
    { 
      key: 'orderNumber', 
      header: 'Order #', 
      renderCell: (row) => (
        <span className="font-mono font-medium">{row.orderNumber}</span>
      )
    },
    { 
      key: 'items', 
      header: 'Products', 
      renderCell: (row) => (
        <div className="max-w-[200px]">
          {row.items?.map((item, i) => (
            <p key={i} className="truncate text-sm">{item.productName}</p>
          ))}
        </div>
      )
    },
    { 
      key: 'total', 
      header: 'Amount', 
      sortable: true,
      renderCell: (row) => <span className="font-bold">₹{row.total?.toFixed(2)}</span>
    },
    { 
      key: 'status', 
      header: 'Status',
      renderCell: (row) => (
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
          {getStatusIcon(row.status)}
          {row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
        </span>
      )
    },
    { 
      key: 'createdAt', 
      header: 'Date', 
      sortable: true,
      renderCell: (row) => new Date(row.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      })
    },
    {
      key: 'actions',
      header: 'Actions',
      renderCell: (row) => (
        <div className="flex gap-2">
          <Link 
            to={`/invoices/${row.invoiceId?._id || row.invoiceId}`}
            className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
            title="View Invoice"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6 animate-fade-in-webgenix">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Orders</h1>
          <p className="text-sm text-text-secondary">View and manage your service orders</p>
        </div>
        <Link 
          to="/marketplace" 
          className="btn-webgenix btn-primary-webgenix btn-md-webgenix flex items-center gap-2"
        >
          <Package size={18} /> New Order
        </Link>
      </div>

      <div className="animate-slide-up-webgenix">
        <FilterBar 
          searchPlaceholder="Search orders..."
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

        <DataTable columns={columns} data={orders} isLoading={loading} />
      </div>
    </DashboardLayout>
  );
}