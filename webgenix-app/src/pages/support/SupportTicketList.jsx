import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DataTable from '../../components/dashboard/DataTable';
import FilterBar from '../../components/dashboard/FilterBar';
import StatusBadge from '../../components/dashboard/StatusBadge';
import TicketDetailModal from '../../components/dashboard/TicketDetailModal';
import { supportService } from '../../services/support.service';

export default function SupportTicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [viewTab, setViewTab] = useState('all'); // 'all' or 'mine'
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'open', 'inprogress', 'answered', 'closed'

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await supportService.getTickets({ status: statusFilter, search, view: viewTab });
      let filteredTickets = response.data?.tickets || [];
      
      if (!statusFilter) {
        if (activeTab === 'open') {
          filteredTickets = filteredTickets.filter(t => ['OPEN', 'CLIENT_REPLY'].includes(t.status?.toUpperCase()));
        } else if (activeTab === 'inprogress') {
          filteredTickets = filteredTickets.filter(t => t.status?.toUpperCase() === 'IN_PROGRESS');
        } else if (activeTab === 'answered') {
          filteredTickets = filteredTickets.filter(t => t.status?.toUpperCase() === 'ANSWERED');
        } else if (activeTab === 'closed') {
          filteredTickets = filteredTickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status?.toUpperCase()));
        }
      }
      
      setTickets(filteredTickets);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, viewTab, activeTab]);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, search, viewTab, activeTab]);

  const handleUpdateTicket = async (id, data) => {
    try {
      await supportService.updateTicket(id, data);
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReplyTicket = async (id, data) => {
    try {
      await supportService.replyTicket(id, data);
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { key: '_id', header: 'ID', renderCell: (r) => <span className="font-mono text-xs">#{r.ticketId || r._id.substring(0,6).toUpperCase()}</span> },
    { 
      key: 'subject', 
      header: 'Subject', 
      sortable: true,
      renderCell: (r) => (
        <button 
          onClick={async () => {
            try {
              const response = await supportService.getTicket(r._id);
              setSelectedTicket({ ...response.data.ticket, messages: response.data.messages });
            } catch (err) {
              console.error(err);
              setSelectedTicket(r);
            }
          }} 
          className="text-accent hover:text-accent-hover font-medium"
        >
          {r.subject}
        </button>
      )
    },
    { 
      key: 'client', 
      header: 'Client', 
      renderCell: (r) => (
        <div className="flex flex-col">
          <span className="font-medium">{r.client?.name || 'N/A'}</span>
          {r.client?.email && (
            <span className="text-xs text-text-muted">{r.client.email}</span>
          )}
        </div>
      ) 
    },
    { key: 'status', header: 'Status', sortable: true, renderCell: (r) => <StatusBadge status={r.status} /> },
    { key: 'priority', header: 'Priority', renderCell: (r) => <StatusBadge status={r.priority} /> },
    { key: 'createdAt', header: 'Created', sortable: true, renderCell: (r) => new Date(r.createdAt).toLocaleDateString() }
  ];

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6 animate-fade-in-webgenix">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Ticket Queue</h1>
          <p className="text-sm text-text-secondary">Handle client support requests.</p>
        </div>
      </div>

      <div className="flex gap-6 mb-6 border-b border-dark-700 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All Tickets' },
          { id: 'open', label: 'Open' },
          { id: 'inprogress', label: 'In Progress' },
          { id: 'answered', label: 'Answered' },
          { id: 'closed', label: 'Resolved & Closed' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setStatusFilter(''); }}
            className={`whitespace-nowrap pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === tab.id ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
          </button>
        ))}
      </div>

      <div className="mb-6 flex gap-2">
        <button 
          onClick={() => setViewTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewTab === 'all' ? 'bg-accent text-white' : 'bg-dark-800 text-text-secondary hover:text-text-primary'}`}
        >
          All Tickets
        </button>
        <button 
          onClick={() => setViewTab('mine')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewTab === 'mine' ? 'bg-accent text-white' : 'bg-dark-800 text-text-secondary hover:text-text-primary'}`}
        >
          My Tickets
        </button>
      </div>

      <div className="animate-slide-up-webgenix">
        <FilterBar 
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search tickets..."
          filters={[
            {
              key: 'status',
              label: 'All Statuses',
              value: statusFilter,
              options: [
                { label: 'Open', value: 'open' },
                { label: 'In Progress', value: 'in_progress' },
                { label: 'Resolved', value: 'resolved' },
                { label: 'Closed', value: 'closed' }
              ]
            }
          ]}
          onFilterChange={(key, val) => {
            if (key === 'status') setStatusFilter(val);
          }}
        />

        <DataTable columns={columns} data={tickets} isLoading={loading} />
      </div>

      <TicketDetailModal 
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        ticket={selectedTicket}
        onUpdate={handleUpdateTicket}
        onReply={handleReplyTicket}
      />
    </DashboardLayout>
  );
}
