import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DataTable from '../../components/dashboard/DataTable';
import FilterBar from '../../components/dashboard/FilterBar';
import StatusBadge from '../../components/dashboard/StatusBadge';
import InvoiceFormModal from '../../components/dashboard/InvoiceFormModal';
import { adminService } from '../../services/admin.service';
import { Plus } from 'lucide-react';

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
      fetchInvoices();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { key: 'invoiceNumber', header: 'Invoice #', sortable: true, renderCell: (r) => <span className="font-mono">{r.invoiceNumber || r._id?.slice(-8)}</span> },
    { key: 'client', header: 'Client', renderCell: (r) => r.userId?.name || r.client?.name || 'N/A' },
    { key: 'total', header: 'Amount', sortable: true, renderCell: (r) => `₹${(r.total || r.amount || 0).toFixed(2)}` },
    { key: 'dueDate', header: 'Due Date', sortable: true, renderCell: (r) => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '-' },
    { key: 'status', header: 'Status', renderCell: (r) => <StatusBadge status={r.status} /> }
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
