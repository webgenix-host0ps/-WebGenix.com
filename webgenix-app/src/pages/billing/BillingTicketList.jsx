import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DataTable from '../../components/dashboard/DataTable';
import StatusBadge from '../../components/dashboard/StatusBadge';
import TicketDetailModal from '../../components/dashboard/TicketDetailModal';
import { billingService } from '../../services/billing.service';
import api from '../../services/api';

export default function BillingTicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'open', 'inprogress', 'answered', 'closed'

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await billingService.getTickets({});
      let filteredTickets = response.data?.tickets || [];
      
      if (activeTab === 'open') {
        filteredTickets = filteredTickets.filter(t => ['OPEN', 'CLIENT_REPLY'].includes(t.status?.toUpperCase()));
      } else if (activeTab === 'inprogress') {
        filteredTickets = filteredTickets.filter(t => t.status?.toUpperCase() === 'IN_PROGRESS');
      } else if (activeTab === 'answered') {
        filteredTickets = filteredTickets.filter(t => t.status?.toUpperCase() === 'ANSWERED');
      } else if (activeTab === 'closed') {
        filteredTickets = filteredTickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status?.toUpperCase()));
      }
      
      setTickets(filteredTickets);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicket = async (id, data) => {
    try {
      await api.patch(`/tickets/${id}/status`, { status: data.status.toUpperCase() });
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReplyTicket = async (id, data) => {
    try {
      await api.post(`/tickets/${id}/messages`, data);
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [activeTab]);

  const columns = [
    { key: '_id', header: 'ID', renderCell: (r) => <span className="font-mono text-xs">#{r._id.substring(0,6).toUpperCase()}</span> },
    { 
      key: 'subject', 
      header: 'Subject',
      renderCell: (r) => (
        <button 
          onClick={async () => {
            try {
              const response = await api.get(`/tickets/${r._id}`);
              setSelectedTicket({ ...response.data.data.ticket, messages: response.data.data.messages });
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
    { key: 'status', header: 'Status', renderCell: (r) => <StatusBadge status={r.status} /> },
    { key: 'priority', header: 'Priority', renderCell: (r) => <StatusBadge status={r.priority} /> },
    { key: 'createdAt', header: 'Created', renderCell: (r) => new Date(r.createdAt).toLocaleDateString() }
  ];

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6 animate-fade-in-webgenix">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Billing Tickets</h1>
          <p className="text-sm text-text-secondary">Support requests directed to the billing department.</p>
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
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === tab.id ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
          </button>
        ))}
      </div>

      <div className="animate-slide-up-webgenix">
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
