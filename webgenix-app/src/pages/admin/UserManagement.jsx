import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { adminService } from '../../services/admin.service';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Ban, 
  CheckCircle, 
  User,
  Eye,
  MoreVertical,
  Filter,
  X,
  Building,
  CreditCard,
  Ticket,
  Server
} from 'lucide-react';

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchName, setSearchName] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log('[UserManagement] Fetching all users...');
      const response = await adminService.getClients({
        limit: 100
        // No role filter - get ALL users (clients, admin, staff)
      });
      console.log('[UserManagement] API response:', response);
      
      // Handle different response structures
      const userData = response.data?.users || response.data?.data?.users || response.data || [];
      console.log('[UserManagement] Users fetched:', userData.length);
      
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (error) {
      console.error('[UserManagement] Error fetching users:', error);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search criteria
  useEffect(() => {
    let filtered = users;

    // Email search
    if (searchEmail) {
      filtered = filtered.filter(user => 
        user.email?.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }

    // Name search
    if (searchName) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.isActive : !user.isActive
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchEmail, searchName, statusFilter, roleFilter]);

  const handleViewDetails = async (client) => {
    setSelectedClient(client);
    setLoadingDetails(true);
    try {
      const response = await adminService.getClient(client._id);
      setClientDetails(response.data);
    } catch (error) {
      console.error('Error fetching client details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await adminService.toggleUserStatus(userId);
      // Refresh the list
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const clearFilters = () => {
    setSearchEmail('');
    setSearchName('');
    setStatusFilter('all');
    setRoleFilter('all');
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '??';
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
      : 'bg-red-500/10 text-red-400 border-red-500/20';
  };

  const activeFiltersCount = [
    searchEmail, searchName, statusFilter !== 'all', roleFilter !== 'all'
  ].filter(Boolean).length;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-webgenix">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-accent" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">User Management</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">All Users</h1>
            <p className="text-text-secondary text-sm mt-1">
              Manage {filteredUsers.length} user accounts (Clients, Admin, Staff)
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-accent text-white' 
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              <Filter size={14} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Search & Filter</h3>
              <button 
                onClick={clearFilters}
                className="text-xs text-text-secondary hover:text-white flex items-center gap-1 transition-colors"
              >
                <X size={12} />
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Email Search */}
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  placeholder="Search by email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="w-full bg-dark-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* Name Search */}
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full bg-dark-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-dark-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-accent transition-colors cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Role Filter */}
              <div className="relative">
                <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full bg-dark-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-accent transition-colors cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                  <option value="support">Support</option>
                  <option value="billing">Billing</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Users', value: users.length },
            { label: 'Clients', value: users.filter(u => u.role === 'client').length },
            { label: 'Admins', value: users.filter(u => u.role === 'admin').length },
            { label: 'Staff', value: users.filter(u => ['support', 'billing'].includes(u.role)).length },
            { label: 'Active', value: users.filter(u => u.isActive).length },
            { label: 'Inactive', value: users.filter(u => !u.isActive).length },
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Client Cards Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-12 text-center">
            <Users size={48} className="mx-auto text-text-muted mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No users found</h3>
            <p className="text-text-secondary">
              {activeFiltersCount > 0 
                ? 'Try adjusting your filters to see more results.' 
                : 'No users registered in the system yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div 
                key={user._id} 
                className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 hover:border-accent/30 transition-all group"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center text-accent font-bold text-lg">
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-accent transition-colors">
                        {user.name || 'Unnamed User'}
                      </h3>
                      <p className="text-xs text-text-muted">{user.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${getStatusColor(user.isActive)}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Client Info */}
                <div className="space-y-2 mb-4">
                  {user.phone && (
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Phone size={12} />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.company && (
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Building size={12} />
                      <span>{user.company}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Calendar size={12} />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 py-4 border-y border-white/5">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{user.services?.length || 0}</p>
                    <p className="text-[10px] text-text-muted uppercase">Services</p>
                  </div>
                  <div className="text-center border-x border-white/5">
                    <p className="text-lg font-bold text-white">{user.invoices?.length || 0}</p>
                    <p className="text-[10px] text-text-muted uppercase">Invoices</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{user.tickets?.length || 0}</p>
                    <p className="text-[10px] text-text-muted uppercase">Tickets</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/admin/clients/${user._id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-accent/10 hover:bg-accent/20 text-accent rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    <Eye size={14} />
                    View Details
                  </button>
                  <button
                    onClick={() => handleToggleStatus(user._id, user.isActive)}
                    className={`px-3 py-2.5 rounded-xl text-xs transition-colors ${
                      user.isActive 
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                    title={user.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {user.isActive ? <Ban size={14} /> : <CheckCircle size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Client Details Modal */}
        {selectedClient && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark-900 border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {loadingDetails ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : clientDetails ? (
                <div className="p-6">
                  {/* Modal Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center text-accent font-bold text-2xl">
                        {getInitials(clientDetails.client?.name)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{clientDetails.client?.name}</h2>
                        <p className="text-sm text-text-muted">{clientDetails.client?.email}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(clientDetails.client?.isActive)}`}>
                          {clientDetails.client?.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedClient(null)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <X size={20} className="text-text-muted" />
                    </button>
                  </div>

                  {/* Client Info Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/[0.03] rounded-xl p-4">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-sm text-white">{clientDetails.client?.phone || 'Not provided'}</p>
                    </div>
                    <div className="bg-white/[0.03] rounded-xl p-4">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-1">Company</p>
                      <p className="text-sm text-white">{clientDetails.client?.company || 'Not provided'}</p>
                    </div>
                    <div className="bg-white/[0.03] rounded-xl p-4">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-1">Role</p>
                      <p className="text-sm text-white capitalize">{clientDetails.client?.role}</p>
                    </div>
                    <div className="bg-white/[0.03] rounded-xl p-4">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-1">Member Since</p>
                      <p className="text-sm text-white">{new Date(clientDetails.client?.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Services Section */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Server size={16} className="text-accent" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Services ({clientDetails.services?.length || 0})</h3>
                    </div>
                    {clientDetails.services?.length > 0 ? (
                      <div className="space-y-2">
                        {clientDetails.services.slice(0, 3).map((service, idx) => (
                          <div key={idx} className="bg-white/[0.03] rounded-xl p-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm text-white font-medium">{service.name}</p>
                              <p className="text-xs text-text-muted">{service.status}</p>
                            </div>
                            <span className="text-xs text-accent font-bold">₹{service.amount}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-text-muted">No active services</p>
                    )}
                  </div>

                  {/* Invoices Section */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard size={16} className="text-accent" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Invoices ({clientDetails.invoices?.length || 0})</h3>
                    </div>
                    {clientDetails.invoices?.length > 0 ? (
                      <div className="space-y-2">
                        {clientDetails.invoices.slice(0, 3).map((invoice, idx) => (
                          <div key={idx} className="bg-white/[0.03] rounded-xl p-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm text-white font-medium">#{invoice.invoiceNumber}</p>
                              <p className="text-xs text-text-muted">{new Date(invoice.dateIssued).toLocaleDateString()}</p>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {invoice.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-text-muted">No invoices</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Link
                      to={`/admin/clients/${selectedClient._id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-accent/80 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-colors"
                    >
                      <Eye size={16} />
                      Full Profile
                    </Link>
                    <button
                      onClick={() => handleToggleStatus(selectedClient._id, selectedClient.isActive)}
                      className={`px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors ${
                        selectedClient.isActive 
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {selectedClient.isActive ? 'Deactivate Account' : 'Activate Account'}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
