import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { billingService } from '../../services/billing.service';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DataTable from '../../components/dashboard/DataTable';
import FilterBar from '../../components/dashboard/FilterBar';
import { FileText, Download, Eye, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function InvoicesList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await billingService.getInvoices({ status: statusFilter });
      setInvoices(response.data || []);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'unpaid': return <Clock className="w-4 h-4 text-warning" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-error" />;
      case 'cancelled':
      case 'refunded': return <XCircle className="w-4 h-4 text-text-muted" />;
      default: return <FileText className="w-4 h-4 text-text-muted" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-success/20 text-success';
      case 'unpaid': return 'bg-warning/20 text-warning';
      case 'overdue': return 'bg-error/20 text-error';
      case 'cancelled':
      case 'refunded': return 'bg-dark-600 text-text-muted';
      default: return 'bg-dark-600 text-text-secondary';
    }
  };

  const columns = [
    { 
      key: 'invoiceNumber', 
      header: 'Invoice #', 
      renderCell: (row) => (
        <span className="font-mono font-medium">{row.invoiceNumber}</span>
      )
    },
    { 
      key: 'items', 
      header: 'Description', 
      renderCell: (row) => (
        <div className="max-w-[250px]">
          {row.items?.slice(0, 2).map((item, i) => (
            <p key={i} className="truncate text-sm">{item.description}</p>
          ))}
          {row.items?.length > 2 && (
            <p className="text-xs text-text-muted">+{row.items.length - 2} more</p>
          )}
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
      key: 'amountDue', 
      header: 'Due', 
      renderCell: (row) => (
        <span className={row.amountDue > 0 ? 'text-warning' : 'text-success'}>
          ₹{row.amountDue?.toFixed(2) || '0.00'}
        </span>
      )
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
      key: 'dueDate', 
      header: 'Due Date', 
      renderCell: (row) => row.dueDate ? new Date(row.dueDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      }) : '-'
    },
    {
      key: 'actions',
      header: 'Actions',
      renderCell: (row) => (
        <div className="flex gap-2">
          <button 
            className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
            title="View Invoice"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6 animate-fade-in-webgenix">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Invoices</h1>
          <p className="text-sm text-text-secondary">View and pay your invoices</p>
        </div>
      </div>

      <div className="animate-slide-up-webgenix">
        <FilterBar 
          searchPlaceholder="Search invoices..."
          filters={[
            {
              key: 'status',
              label: 'All Statuses',
              value: statusFilter,
              options: [
                { label: 'Paid', value: 'paid' },
                { label: 'Unpaid', value: 'unpaid' },
                { label: 'Overdue', value: 'overdue' },
                { label: 'Cancelled', value: 'cancelled' }
              ]
            }
          ]}
          onFilterChange={(key, val) => {
            if (key === 'status') setStatusFilter(val);
          }}
        />

        <DataTable columns={columns} data={invoices} isLoading={loading} />
      </div>
    </DashboardLayout>
  );
}