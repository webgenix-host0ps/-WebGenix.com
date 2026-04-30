import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DataTable from '../../components/dashboard/DataTable';
import FilterBar from '../../components/dashboard/FilterBar';
import { Server, Play, Pause, Power, AlertCircle, CheckCircle, Clock, XCircle, ExternalLink } from 'lucide-react';

export default function ServicesList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await api.get('/billing/services', { params: { status: statusFilter } });
      setServices(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [statusFilter]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'pending': return <Clock className="w-4 h-4 text-warning" />;
      case 'suspended': return <Pause className="w-4 h-4 text-error" />;
      case 'cancelled':
      case 'terminated': return <XCircle className="w-4 h-4 text-text-muted" />;
      default: return <AlertCircle className="w-4 h-4 text-text-muted" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-success/20 text-success';
      case 'pending': return 'bg-warning/20 text-warning';
      case 'suspended': return 'bg-error/20 text-error';
      case 'cancelled':
      case 'terminated': return 'bg-dark-600 text-text-muted';
      default: return 'bg-dark-600 text-text-secondary';
    }
  };

  const columns = [
    { 
      key: 'productName', 
      header: 'Service', 
      renderCell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
            <Server className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="font-medium">{row.productName}</p>
            {row.domain && (
              <p className="text-sm text-text-secondary">{row.domain}</p>
            )}
          </div>
        </div>
      )
    },
    { 
      key: 'cycle', 
      header: 'Billing Cycle', 
      renderCell: (row) => (
        <span className="capitalize">{row.cycle}</span>
      )
    },
    { 
      key: 'recurringAmount', 
      header: 'Amount', 
      sortable: true,
      renderCell: (row) => <span className="font-bold">₹{row.recurringAmount}/<span className="text-xs font-normal">{row.cycle}</span></span>
    },
    { 
      key: 'nextDueDate', 
      header: 'Next Due', 
      renderCell: (row) => {
        if (!row.nextDueDate) return '-';
        const dueDate = new Date(row.nextDueDate);
        const isOverdue = dueDate < new Date() && row.status === 'active';
        return (
          <span className={isOverdue ? 'text-error' : ''}>
            {dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        );
      }
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
      key: 'actions',
      header: 'Actions',
      renderCell: (row) => (
        <div className="flex gap-2">
          <button 
            className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
            title="Manage Service"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6 animate-fade-in-webgenix">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Services</h1>
          <p className="text-sm text-text-secondary">Manage your active hosting services</p>
        </div>
      </div>

      <div className="animate-slide-up-webgenix">
        <FilterBar 
          searchPlaceholder="Search services..."
          filters={[
            {
              key: 'status',
              label: 'All Statuses',
              value: statusFilter,
              options: [
                { label: 'Active', value: 'active' },
                { label: 'Pending', value: 'pending' },
                { label: 'Suspended', value: 'suspended' },
                { label: 'Cancelled', value: 'cancelled' }
              ]
            }
          ]}
          onFilterChange={(key, val) => {
            if (key === 'status') setStatusFilter(val);
          }}
        />

        <DataTable columns={columns} data={services} isLoading={loading} />
      </div>
    </DashboardLayout>
  );
}