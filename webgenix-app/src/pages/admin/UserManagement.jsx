import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DataTable from '../../components/dashboard/DataTable';
import StatusBadge from '../../components/dashboard/StatusBadge';
import ActionMenu from '../../components/dashboard/ActionMenu';
import { adminService } from '../../services/admin.service';
import { Shield, Ban, CheckCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getClients({});
      // Handle both old and new API response structure
      setUsers(response.data?.users || response.data?.clients || []);
    } catch (error) {
      console.error(error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    { 
      key: 'name', 
      header: 'Name', 
      sortable: true,
      renderCell: (r) => (
        <Link to={`/admin/clients/${r._id}`} className="text-accent hover:underline font-bold">
          {r.name}
        </Link>
      )
    },
    { key: 'email', header: 'Email' },
    { 
      key: 'role', 
      header: 'Role', 
      renderCell: (r) => (
        <span className="capitalize px-2 py-1 rounded bg-dark-700 text-text-secondary text-xs border border-dark-600">
          {r.role}
        </span>
      ) 
    },
    { key: 'status', header: 'Status', renderCell: (r) => <StatusBadge status={r.isActive ? 'active' : 'inactive'} /> },
    { 
      key: 'actions', 
      header: '', 
      renderCell: (r) => (
        <ActionMenu actions={[
          { label: 'View Profile', icon: User, onClick: () => window.location.href = `/admin/clients/${r._id}` },
          { label: 'Change Role', icon: Shield, onClick: () => console.log('Change role', r._id) },
          { label: r.isActive ? 'Deactivate' : 'Activate', icon: r.isActive ? Ban : CheckCircle, danger: r.isActive, onClick: () => console.log('Toggle status', r._id) }
        ]} />
      ) 
    }
  ];

  return (
    <DashboardLayout>
      <div className="mb-6 animate-fade-in-webgenix">
        <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
        <p className="text-sm text-text-secondary">Manage clients, staff, and their permissions.</p>
      </div>

      <div className="animate-slide-up-webgenix">
        <DataTable columns={columns} data={users} isLoading={loading} />
      </div>
    </DashboardLayout>
  );
}
