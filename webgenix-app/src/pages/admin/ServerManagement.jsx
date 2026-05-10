import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { adminService } from '../../services/admin.service';
import { Server, Plus, Settings, Activity, HardDrive, ShieldCheck, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ServerManagement() {
  const [servers, setServers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddServer, setShowAddServer] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  
  const [newGroup, setNewGroup] = useState({ name: '', fillType: 'least_used' });
  const [savingGroup, setSavingGroup] = useState(false);
  
  const [newServer, setNewServer] = useState({ 
    name: '', type: 'cpanel', hostname: '', ipAddress: '', 
    username: '', password: '', serverGroupId: '', maxAccounts: 100 
  });
  const [savingServer, setSavingServer] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [serversRes, groupsRes] = await Promise.all([
        adminService.getServers(),
        adminService.getServerGroups()
      ]);
      setServers(serversRes.data || []);
      setGroups(groupsRes.data || []);
    } catch (error) {
      toast.error('Failed to load server data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'inactive': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'maintenance': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-white/5 text-text-muted border-white/10';
    }
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    if (!newGroup.name) return toast.error('Group name is required');
    setSavingGroup(true);
    try {
      await adminService.createServerGroup(newGroup);
      toast.success('Server group created');
      setShowAddGroup(false);
      setNewGroup({ name: '', fillType: 'least_used' });
      fetchData();
    } catch (error) {
      toast.error('Failed to create group');
    } finally {
      setSavingGroup(false);
    }
  };

  const handleAddServer = async (e) => {
    e.preventDefault();
    if (!newServer.name || !newServer.hostname) return toast.error('Name and hostname are required');
    setSavingServer(true);
    try {
      await adminService.createServer(newServer);
      toast.success('Server added successfully');
      setShowAddServer(false);
      setNewServer({ name: '', type: 'cpanel', hostname: '', ipAddress: '', username: '', password: '', serverGroupId: '', maxAccounts: 100 });
      fetchData();
    } catch (error) {
      toast.error('Failed to add server');
    } finally {
      setSavingServer(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-webgenix">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Server size={16} className="text-accent" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Infrastructure</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Server Management</h1>
            <p className="text-text-secondary text-sm mt-1">Manage WHM/cPanel servers and provisioning groups</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowAddGroup(true)}
              className="bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <Settings size={14} />
              New Group
            </button>
            <button 
              onClick={() => setShowAddServer(true)}
              className="bg-accent hover:bg-accent/80 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-accent/20 flex items-center gap-2"
            >
              <Plus size={14} />
              Add Server
            </button>
          </div>
        </div>

        {/* Server Groups Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {groups.length === 0 ? (
            <div className="md:col-span-3 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl p-8 text-center">
              <p className="text-text-muted text-sm italic">No server groups configured yet.</p>
            </div>
          ) : (
            groups.map(group => (
              <div key={group._id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-accent/30 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white group-hover:text-accent transition-colors">{group.name}</h3>
                  <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">{group.fillType}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-secondary">
                  <div className="flex items-center gap-1">
                    <Activity size={12} />
                    <span>{group.servers?.length || 0} Servers</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Servers Table/Grid */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Active Infrastructure</h3>
            <span className="text-xs text-text-muted">{servers.length} Servers Online</span>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : servers.length === 0 ? (
            <div className="p-12 text-center">
              <HardDrive size={40} className="mx-auto text-text-muted mb-4 opacity-20" />
              <p className="text-text-secondary">No servers found. Start by adding a WHM server.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-wider">Server Details</th>
                    <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-wider">IP / Hostname</th>
                    <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-wider">Capacity</th>
                    <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {servers.map(server => (
                    <tr key={server._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-secondary group-hover:text-accent transition-colors">
                            <Server size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{server.name}</p>
                            <p className="text-[10px] text-text-muted uppercase tracking-tighter">{server.type} • {server.serverGroupId?.name || 'Unassigned'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-text-secondary">{server.hostname}</p>
                        <p className="text-[10px] text-text-muted">{server.ipAddress}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-[100px]">
                            <div 
                              className="h-full bg-accent" 
                              style={{ width: `${(server.activeAccounts / server.maxAccounts) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-text-secondary">{server.activeAccounts}/{server.maxAccounts}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase border ${getStatusColor(server.status)}`}>
                          {server.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-white transition-colors">
                            <Edit size={14} />
                          </button>
                          <button className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Group Modal */}
      {showAddGroup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Create Server Group</h3>
            <form onSubmit={handleAddGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Group Name</label>
                <input 
                  type="text" 
                  value={newGroup.name}
                  onChange={e => setNewGroup({...newGroup, name: e.target.value})}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none"
                  placeholder="e.g. Shared Hosting US"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Fill Type</label>
                <select 
                  value={newGroup.fillType}
                  onChange={e => setNewGroup({...newGroup, fillType: e.target.value})}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none"
                >
                  <option value="least_used">Least Used Server First</option>
                  <option value="strict_sequential">Strict Sequential Fill</option>
                  <option value="random">Random Distribution</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddGroup(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={savingGroup}
                  className="flex-1 py-2.5 bg-accent hover:bg-accent/80 text-white rounded-xl text-xs font-bold uppercase transition-colors disabled:opacity-50"
                >
                  {savingGroup ? 'Saving...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Server Modal */}
      {showAddServer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Add New Server</h3>
            <form onSubmit={handleAddServer} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Server Name</label>
                <input 
                  type="text" 
                  value={newServer.name}
                  onChange={e => setNewServer({...newServer, name: e.target.value})}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-accent outline-none"
                  placeholder="e.g. WHM Node 1"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Server Group</label>
                <select 
                  value={newServer.serverGroupId}
                  onChange={e => setNewServer({...newServer, serverGroupId: e.target.value})}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-accent outline-none"
                >
                  <option value="">None (Unassigned)</option>
                  {groups.map(g => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Hostname</label>
                <input 
                  type="text" 
                  value={newServer.hostname}
                  onChange={e => setNewServer({...newServer, hostname: e.target.value})}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-accent outline-none"
                  placeholder="node1.webgenix.com"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">IP Address</label>
                <input 
                  type="text" 
                  value={newServer.ipAddress}
                  onChange={e => setNewServer({...newServer, ipAddress: e.target.value})}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-accent outline-none"
                  placeholder="192.168.1.1"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">WHM Username</label>
                <input 
                  type="text" 
                  value={newServer.username}
                  onChange={e => setNewServer({...newServer, username: e.target.value})}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-accent outline-none"
                  placeholder="root"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">WHM API Token / Pass</label>
                <input 
                  type="password" 
                  value={newServer.password}
                  onChange={e => setNewServer({...newServer, password: e.target.value})}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-accent outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Max Accounts</label>
                <input 
                  type="number" 
                  value={newServer.maxAccounts}
                  onChange={e => setNewServer({...newServer, maxAccounts: parseInt(e.target.value)})}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-accent outline-none"
                  min="1"
                />
              </div>
              <div className="col-span-2 pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddServer(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={savingServer}
                  className="flex-1 py-2.5 bg-accent hover:bg-accent/80 text-white rounded-xl text-xs font-bold uppercase transition-colors disabled:opacity-50"
                >
                  {savingServer ? 'Saving...' : 'Add Server'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
