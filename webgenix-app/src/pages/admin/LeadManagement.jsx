import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DataTable from '../../components/dashboard/DataTable';
import FilterBar from '../../components/dashboard/FilterBar';
import StatusBadge from '../../components/dashboard/StatusBadge';
import LeadStatusUpdate from '../../components/dashboard/LeadStatusUpdate';
import { adminService } from '../../services/admin.service';
import { Users, Filter, Plus, Download, TrendingUp } from 'lucide-react';

export default function LeadManagement() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await adminService.getLeads({ status: statusFilter });
      // Handle both old and new API response structure
      setLeads(response.data?.leads || response.data || []);
    } catch (error) {
      console.error(error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const handleUpdateLead = async (id, data) => {
    try {
      await adminService.updateLead(id, data);
      fetchLeads();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { key: 'name', header: 'ENTITY NAME', sortable: true, renderCell: (r) => (
        <span className="text-white font-black uppercase tracking-tight">{r.name}</span>
    )},
    { key: 'email', header: 'COMMUNICATION NODE', renderCell: (r) => (
        <span className="text-text-muted font-bold lowercase opacity-60">{r.email}</span>
    )},
    { key: 'status', header: 'SIGNAL STATUS', renderCell: (r) => <StatusBadge status={r.isActive ? 'active' : 'inactive'} /> },
    { key: 'createdAt', header: 'INCEPTION DATE', sortable: true, renderCell: (r) => (
        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString()}</span>
    )},
    { 
      key: 'actions', 
      header: 'CONTROL', 
      renderCell: (r) => (
        <button 
          onClick={() => setSelectedLead(r)}
          className="text-accent hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
        >
          Adjust Matrix
        </button>
      ) 
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-[32px] animate-in fade-in duration-700">
        
        {/* Lead Hero */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Users size={16} className="text-accent" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Revenue Matrix</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">Lead Management</h1>
            <p className="text-text-secondary text-sm font-bold uppercase tracking-widest opacity-60 mt-2">Track and convert prospective client signals into active nodes.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2">
              <Download size={14} /> Export Log
            </button>
            <button className="px-6 py-3 bg-accent hover:bg-accent-hover text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-accent/20 flex items-center gap-2">
              <Plus size={14} /> Manual Inject
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { label: 'Total Prospects', value: leads.length, icon: Users, color: 'blue' },
                { label: 'Conversion Flux', value: '12.4%', icon: TrendingUp, color: 'green' },
                { label: 'Active Signals', value: leads.filter(l => l.isActive).length, icon: Filter, color: 'amber' },
            ].map((stat, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/[0.06] p-8 rounded-[32px] group hover:border-accent/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center text-${stat.color}-400`}>
                            <stat.icon size={18} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-1">{stat.value}</h3>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-50">{stat.label}</p>
                </div>
            ))}
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-[40px] p-2 overflow-hidden shadow-2xl">
          <div className="p-8 pb-4">
            <FilterBar 
              filters={[
                {
                  key: 'status',
                  label: 'SIGNAL FILTER',
                  value: statusFilter,
                  options: [
                    { label: 'All Signals', value: '' },
                    { label: 'New Node', value: 'new' },
                    { label: 'Contacted', value: 'contacted' },
                    { label: 'Negotiation', value: 'negotiation' },
                    { label: 'Synchronized (Won)', value: 'won' },
                    { label: 'Severed (Lost)', value: 'lost' }
                  ]
                }
              ]}
              onFilterChange={(key, val) => {
                if (key === 'status') setStatusFilter(val);
              }}
            />
          </div>

          <DataTable columns={columns} data={leads} isLoading={loading} />
        </div>

        <LeadStatusUpdate 
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          lead={selectedLead}
          onUpdate={handleUpdateLead}
        />
        
        <div className="h-10" />
      </div>
    </DashboardLayout>
  );
}
