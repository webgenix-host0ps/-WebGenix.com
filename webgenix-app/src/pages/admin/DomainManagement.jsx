import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { adminService } from '../../services/admin.service';
import { Globe, Plus, DollarSign, Cpu, Search, Filter, MoreVertical, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DomainManagement() {
  const [domains, setDomains] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [registrars, setRegistrars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');

  const [showAddTld, setShowAddTld] = useState(false);
  const [newTld, setNewTld] = useState({ tld: '', registerPrice: 0, renewPrice: 0, transferPrice: 0 });
  const [savingTld, setSavingTld] = useState(false);

  const [showAddRegistrar, setShowAddRegistrar] = useState(false);
  const [newRegistrar, setNewRegistrar] = useState({ name: '', slug: '', apiUrl: '', apiKey: '' });
  const [savingRegistrar, setSavingRegistrar] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [domainsRes, pricingRes, registrarsRes] = await Promise.all([
        adminService.getDomains(),
        adminService.getTldPricing(),
        adminService.getRegistrars()
      ]);
      setDomains(domainsRes.data?.domains || []);
      setPricing(pricingRes.data || []);
      setRegistrars(registrarsRes.data || []);
    } catch (error) {
      toast.error('Failed to load domain data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'list', label: 'All Domains', icon: Globe },
    { id: 'pricing', label: 'TLD Pricing', icon: DollarSign },
    { id: 'registrars', label: 'Registrars', icon: Cpu },
  ];

  const handleAddTld = async (e) => {
    e.preventDefault();
    if (!newTld.tld) return toast.error('TLD is required');
    setSavingTld(true);
    try {
      await adminService.createTldPricing(newTld);
      toast.success('TLD added successfully');
      setShowAddTld(false);
      setNewTld({ tld: '', registerPrice: 0, renewPrice: 0, transferPrice: 0 });
      fetchData();
    } catch (error) {
      toast.error('Failed to add TLD');
    } finally {
      setSavingTld(false);
    }
  };

  const handleAddRegistrar = async (e) => {
    e.preventDefault();
    if (!newRegistrar.name) return toast.error('Name is required');
    setSavingRegistrar(true);
    try {
      await adminService.createRegistrar(newRegistrar);
      toast.success('Registrar added successfully');
      setShowAddRegistrar(false);
      setNewRegistrar({ name: '', slug: '', apiUrl: '', apiKey: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to add registrar');
    } finally {
      setSavingRegistrar(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-webgenix">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe size={16} className="text-accent" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Registration</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Domain Management</h1>
            <p className="text-text-secondary text-sm mt-1">Manage client domains, TLD pricing and registrar APIs</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-2xl w-fit border border-white/[0.06]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.id 
                  ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                  : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="animate-slide-up-webgenix">
            {activeTab === 'list' && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input 
                      type="text" 
                      placeholder="Search domains..." 
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent"
                    />
                  </div>
                  <button className="p-2 bg-white/5 rounded-xl text-text-muted hover:text-white">
                    <Filter size={16} />
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/[0.02]">
                        <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-wider">Domain Name</th>
                        <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-wider">Client</th>
                        <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-wider">Expiry</th>
                        <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {domains.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-text-muted italic">No domains registered yet.</td>
                        </tr>
                      ) : (
                        domains.map(domain => (
                          <tr key={domain._id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-white">{domain.name}</p>
                              <p className="text-[10px] text-text-muted uppercase">{domain.registrarId?.name || 'Manual'}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-text-secondary">{domain.userId?.name}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-text-muted">
                              {domain.expiryDate ? new Date(domain.expiryDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {domain.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="p-2 hover:bg-white/5 rounded-lg text-text-muted">
                                <MoreVertical size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {pricing.map(item => (
                  <div key={item._id} className="card-webgenix group p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-black text-accent">.{item.tld}</div>
                      <div className="text-xs text-text-muted uppercase">Pricing</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Register</span>
                        <span className="font-bold text-white">₹{item.registerPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Renewal</span>
                        <span className="font-bold text-white">₹{item.renewPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Transfer</span>
                        <span className="font-bold text-white">₹{item.transferPrice}</span>
                      </div>
                    </div>
                    <button className="w-full mt-6 py-2 bg-white/5 group-hover:bg-accent group-hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                      Edit Pricing
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => setShowAddTld(true)}
                  className="border-2 border-dashed border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:border-accent/50 transition-all text-text-muted hover:text-accent"
                >
                  <Plus size={32} />
                  <span className="text-xs font-bold uppercase tracking-widest">Add New TLD</span>
                </button>
              </div>
            )}

            {activeTab === 'registrars' && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button 
                    onClick={() => setShowAddRegistrar(true)}
                    className="bg-accent hover:bg-accent/80 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-accent/20 flex items-center gap-2"
                  >
                    <Plus size={14} />
                    Add Registrar
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {registrars.map(reg => (
                  <div key={reg._id} className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-accent">
                      <Cpu size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-white">{reg.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${reg.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {reg.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mb-4 truncate">{reg.apiUrl}</p>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-bold uppercase text-white hover:bg-white/10 transition-colors">Configure API</button>
                        <button className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-bold uppercase text-white hover:bg-white/10 transition-colors">Test Connection</button>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add TLD Modal */}
      {showAddTld && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Add TLD Pricing</h3>
            <form onSubmit={handleAddTld} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">TLD (e.g. com, net)</label>
                <input 
                  type="text" 
                  value={newTld.tld}
                  onChange={e => setNewTld({...newTld, tld: e.target.value.replace('.', '')})}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none"
                  placeholder="com"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Register</label>
                  <input 
                    type="number" 
                    value={newTld.registerPrice}
                    onChange={e => setNewTld({...newTld, registerPrice: Number(e.target.value)})}
                    className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Renew</label>
                  <input 
                    type="number" 
                    value={newTld.renewPrice}
                    onChange={e => setNewTld({...newTld, renewPrice: Number(e.target.value)})}
                    className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Transfer</label>
                  <input 
                    type="number" 
                    value={newTld.transferPrice}
                    onChange={e => setNewTld({...newTld, transferPrice: Number(e.target.value)})}
                    className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddTld(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={savingTld}
                  className="flex-1 py-2.5 bg-accent hover:bg-accent/80 text-white rounded-xl text-xs font-bold uppercase transition-colors disabled:opacity-50"
                >
                  {savingTld ? 'Saving...' : 'Add TLD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Registrar Modal */}
      {showAddRegistrar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Add Registrar API</h3>
            <form onSubmit={handleAddRegistrar} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Registrar Name</label>
                <input 
                  type="text" 
                  value={newRegistrar.name}
                  onChange={e => setNewRegistrar({...newRegistrar, name: e.target.value})}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none"
                  placeholder="e.g. ResellerClub"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Slug (Internal)</label>
                <input 
                  type="text" 
                  value={newRegistrar.slug}
                  onChange={e => setNewRegistrar({...newRegistrar, slug: e.target.value})}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none"
                  placeholder="e.g. resellerclub"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">API URL</label>
                <input 
                  type="text" 
                  value={newRegistrar.apiUrl}
                  onChange={e => setNewRegistrar({...newRegistrar, apiUrl: e.target.value})}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none"
                  placeholder="https://testapi.resellerclub.com"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddRegistrar(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={savingRegistrar}
                  className="flex-1 py-2.5 bg-accent hover:bg-accent/80 text-white rounded-xl text-xs font-bold uppercase transition-colors disabled:opacity-50"
                >
                  {savingRegistrar ? 'Saving...' : 'Add Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
