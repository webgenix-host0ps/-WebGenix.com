import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DataTable from '../../components/dashboard/DataTable';
import FilterBar from '../../components/dashboard/FilterBar';
import StatusBadge from '../../components/dashboard/StatusBadge';
import InvoiceFormModal from '../../components/dashboard/InvoiceFormModal';
import { adminService } from '../../services/admin.service';
import { Plus, CheckCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminInvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await adminService.getInvoices({ status: statusFilter, search });
      // Handle both old and new API response structure
      setInvoices(response.data?.invoices || response.data || []);
    } catch (error) {
      console.error(error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, search]);

  const handleCreateInvoice = async (data) => {
    try {
      await adminService.createInvoice(data);
      toast.success('Invoice created successfully');
      setShowModal(false);
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to create invoice');
      console.error(error);
    }
  };

  const handleMarkPaid = async (id) => {
    if (window.confirm('Are you sure you want to mark this invoice as paid?')) {
      try {
        await adminService.updateInvoiceStatus(id, 'paid');
        toast.success('Invoice marked as paid');
        fetchInvoices();
      } catch (error) {
        toast.error('Failed to update invoice');
      }
    }
  };

  const columns = [
    { key: 'invoiceNumber', header: 'Invoice #', sortable: true, renderCell: (r) => <span className="font-mono">{r.invoiceNumber || r._id?.slice(-8)}</span> },
    { key: 'client', header: 'Client', renderCell: (r) => r.userId?.name || r.client?.name || 'N/A' },
    { key: 'total', header: 'Amount', sortable: true, renderCell: (r) => `₹${(r.total || r.amount || 0).toFixed(2)}` },
    { key: 'dueDate', header: 'Due Date', sortable: true, renderCell: (r) => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '-' },
    { key: 'status', header: 'Status', renderCell: (r) => <StatusBadge status={r.status} /> },
    { 
      key: 'actions', 
      header: '', 
      renderCell: (r) => (
        <div className="flex gap-2 justify-end">
          <Link 
            to={`/admin/invoices/${r._id}`}
            className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye size={16} className="text-text-muted" />
          </Link>
          {r.status !== 'paid' && (
            <button 
              onClick={() => handleMarkPaid(r._id)}
              className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
              title="Mark as Paid"
            >
              <CheckCircle size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6 animate-fade-in-webgenix">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Invoices</h1>
          <p className="text-sm text-text-secondary">Manage client billing and payments.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-webgenix btn-primary-webgenix btn-md-webgenix flex items-center gap-2"
        >
          <Plus size={18} /> Generate Invoice
        </button>
      </div>

      <div className="animate-slide-up-webgenix">
        <FilterBar 
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search invoices by ID or Client..."
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

      <InvoiceFormModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleCreateInvoice}
      />
    </DashboardLayout>
  );
}
