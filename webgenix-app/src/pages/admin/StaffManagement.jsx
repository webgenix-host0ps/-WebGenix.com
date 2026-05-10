import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { adminService } from '../../services/admin.service';
import { 
  Shield, 
  Search, 
  Mail, 
  User, 
  Plus, 
  X, 
  Lock, 
  CheckCircle, 
  Ban,
  UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'support',
    phone: ''
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      // Fetch all users and filter by staff roles on client side or via API if supported
      // For now, get users with admin/support/billing roles
      const response = await adminService.getClients({ limit: 100 });
      const userData = response.data?.users || response.data || [];
      const staffMembers = userData.filter(u => ['admin', 'support', 'billing'].includes(u.role));
      setStaff(staffMembers);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      toast.error('Failed to load staff accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.createUser(formData);
      toast.success('Staff account created successfully');
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'support', phone: '' });
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create staff account');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await adminService.toggleUserStatus(id);
      toast.success('Account status updated');
      fetchStaff();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredStaff = staff.filter(member => 
    member.name?.toLowerCase().includes(search.toLowerCase()) ||
    member.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="animate-fade-in-webgenix">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-accent" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Internal Security</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Staff Management</h1>
            <p className="text-text-secondary text-sm mt-1">Manage administrative and support team accounts.</p>
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-accent hover:bg-accent/80 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-accent/20 flex items-center gap-2"
          >
            <UserPlus size={16} /> Create Staff Account
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search staff by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-900/50 border border-header-border rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-text-muted focus:outline-none focus:border-accent transition-all"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
             <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((member) => (
              <div key={member._id} className="bg-dark-900/30 border border-header-border rounded-[28px] p-6 hover:border-accent/30 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-accent font-black text-xl">
                    {member.name?.charAt(0) || 'S'}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    member.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    member.role === 'billing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {member.role}
                  </div>
                </div>

                <div className="space-y-1 mb-6">
                  <h3 className="text-lg font-black text-white group-hover:text-accent transition-colors">{member.name}</h3>
                  <p className="text-sm text-text-muted flex items-center gap-2">
                    <Mail size={12} /> {member.email}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${member.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                   </div>
                   <button 
                     onClick={() => handleToggleStatus(member._id)}
                     className={`p-2 rounded-lg transition-colors ${
                       member.isActive ? 'text-red-400 hover:bg-red-400/10' : 'text-emerald-400 hover:bg-emerald-400/10'
                     }`}
                   >
                     {member.isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Staff Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark-900 border border-header-border rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300">
              <div className="p-8 border-b border-header-border flex justify-between items-center">
                <div>
                   <h2 className="text-2xl font-black text-white tracking-tight">Create Staff Account</h2>
                   <p className="text-text-muted text-xs mt-1">Assign roles and permissions to team members.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-text-muted">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                   <div>
                      <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-dark-800 border border-header-border rounded-xl px-4 py-3 text-white focus:border-accent outline-none"
                        required
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-dark-800 border border-header-border rounded-xl px-4 py-3 text-white focus:border-accent outline-none"
                        required
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Role</label>
                        <select 
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className="w-full bg-dark-800 border border-header-border rounded-xl px-4 py-3 text-white focus:border-accent outline-none appearance-none"
                        >
                          <option value="support">Support Staff</option>
                          <option value="billing">Billing Staff</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Password</label>
                        <input 
                          type="password" 
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full bg-dark-800 border border-header-border rounded-xl px-4 py-3 text-white focus:border-accent outline-none"
                          required
                        />
                      </div>
                   </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-accent/20"
                >
                  Provision Staff Account
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
