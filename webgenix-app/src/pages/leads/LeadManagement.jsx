import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DataTable from '../../components/dashboard/DataTable';
import FilterBar from '../../components/dashboard/FilterBar';
import StatusBadge from '../../components/dashboard/StatusBadge';
import LeadStatusUpdate from '../../components/dashboard/LeadStatusUpdate';
import { leadService } from '../../services/lead.service';

export default function LeadManagement() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await leadService.getLeads({ status: statusFilter });
      setLeads(response.data.leads);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const handleUpdateLead = async (id, data) => {
    try {
      await leadService.updateLead(id, data);
      fetchLeads();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'Status', renderCell: (r) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', header: 'Date Added', sortable: true, renderCell: (r) => new Date(r.createdAt).toLocaleDateString() },
    { 
      key: 'actions', 
      header: 'Actions', 
      renderCell: (r) => (
        <button 
          onClick={() => setSelectedLead(r)}
          className="text-accent hover:text-accent-hover text-sm font-medium"
        >
          Update
        </button>
      ) 
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6 animate-fade-in-webgenix">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Pipeline</h1>
          <p className="text-sm text-text-secondary">Manage your assigned leads.</p>
        </div>
      </div>

      <div className="animate-slide-up-webgenix">
        <FilterBar 
          filters={[
            {
              key: 'status',
              label: 'All Leads',
              value: statusFilter,
              options: [
                { label: 'New', value: 'new' },
                { label: 'Contacted', value: 'contacted' },
                { label: 'Negotiation', value: 'negotiation' },
                { label: 'Won', value: 'won' },
                { label: 'Lost', value: 'lost' }
              ]
            }
          ]}
          onFilterChange={(key, val) => {
            if (key === 'status') setStatusFilter(val);
          }}
        />

        <DataTable columns={columns} data={leads} isLoading={loading} />
      </div>

      <LeadStatusUpdate 
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        lead={selectedLead}
        onUpdate={handleUpdateLead}
      />
    </DashboardLayout>
  );
}
