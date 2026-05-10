import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DataTable from '../../components/dashboard/DataTable';
import FilterBar from '../../components/dashboard/FilterBar';
import StatusBadge from '../../components/dashboard/StatusBadge';
import { adminService } from '../../services/admin.service';
import { useDebounce } from '../../hooks/useDebounce';
import { Server, User, Calendar, DollarSign, Settings, Ban, Power, Trash2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminServicesList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getAdminServices({
        page,
        limit: 10,
        status: statusFilter,
        productType: typeFilter,
        search: debouncedSearch
      });
      setServices(response.data || []);
      if (response.meta) {
        setTotalPages(response.meta.pages);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, debouncedSearch]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleStatusUpdate = async (id, status) => {
    const reason = window.prompt(`Reason for changing status to ${status}:`, 'Admin manual action');
    if (reason === null) return;

    try {
      await adminService.updateServiceStatus(id, status, reason);
      toast.success(`Service ${status} successfully`);
      fetchServices();
    } catch (error) {
      console.error('Failed to update service status:', error);
      toast.error(`Failed to ${status} service`);
    }
  };

  const columns = [
    {
      key: 'productName',
      header: 'Service / Product',
      renderCell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center text-accent">
            <Server size={16} />
          </div>
          <div>
            <p className="font-bold text-white text-sm">{row.productName || row.productId?.name || 'N/A'}</p>
            <p className="text-xs text-text-muted font-mono">{row.domain || 'No Domain'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'userId',
      header: 'Client',
      renderCell: (row) => (
        <div className="flex flex-col">
          <Link to={`/admin/clients/${row.userId?._id}`} className="font-medium text-white hover:text-accent transition-colors">
            {row.userId?.name || 'N/A'}
          </Link>
          <span className="text-xs text-text-muted">{row.userId?.email || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'recurringAmount',
      header: 'Pricing',
      renderCell: (row) => (
        <div>
          <p className="font-bold text-white text-sm">${(row.recurringAmount || 0).toFixed(2)}</p>
          <p className="text-[10px] text-text-muted uppercase tracking-wider">{row.cycle}</p>
        </div>
      )
    },
    {
      key: 'nextDueDate',
      header: 'Next Due',
      renderCell: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <Calendar size={12} />
          {new Date(row.nextDueDate).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      renderCell: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'actions',
      header: 'Actions',
      renderCell: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'active' ? (
            <button 
              onClick={() => handleStatusUpdate(row._id, 'suspended')}
              className="p-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-lg transition-colors" 
              title="Suspend"
            >
              <Ban size={14} />
            </button>
          ) : row.status === 'suspended' ? (
            <button 
              onClick={() => handleStatusUpdate(row._id, 'active')}
              className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors" 
              title="Unsuspend"
            >
              <Power size={14} />
            </button>
          ) : null}
          
          <button 
            onClick={() => handleStatusUpdate(row._id, 'terminated')}
            className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors" 
            title="Terminate"
          >
            <Trash2 size={14} />
          </button>
          
          <Link 
            to={`/admin/clients/${row.userId?._id}?tab=services`}
            className="p-2 bg-white/5 text-text-muted hover:text-white rounded-lg transition-colors"
            title="View Details"
          >
            <ExternalLink size={14} />
          </Link>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in-webgenix">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Service Management</h1>
            <p className="text-text-secondary mt-1">Manage active hosting and product services across all clients.</p>
          </div>
        </div>

        <FilterBar 
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by domain, product or client name..."
          filters={[
            {
              key: 'status',
              label: 'All Statuses',
              value: statusFilter,
              options: [
                { label: 'Active', value: 'active' },
                { label: 'Suspended', value: 'suspended' },
                { label: 'Terminated', value: 'terminated' },
                { label: 'Pending', value: 'pending' },
                { label: 'Cancelled', value: 'cancelled' }
              ]
            },
            {
              key: 'type',
              label: 'All Types',
              value: typeFilter,
              options: [
                { label: 'Hosting', value: 'hosting' },
                { label: 'Reseller', value: 'reseller' },
                { label: 'VPS', value: 'vps' },
                { label: 'Dedicated', value: 'dedicated' }
              ]
            }
          ]}
          onFilterChange={(key, val) => {
            if (key === 'status') setStatusFilter(val);
            if (key === 'type') setTypeFilter(val);
            setPage(1);
          }}
        />

        <div className="mt-6">
          <DataTable 
            columns={columns} 
            data={services} 
            isLoading={loading} 
            pagination={{
              currentPage: page,
              totalPages: totalPages,
              onPageChange: setPage
            }}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
