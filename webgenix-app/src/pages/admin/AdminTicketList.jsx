import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DataTable from '../../components/dashboard/DataTable';
import FilterBar from '../../components/dashboard/FilterBar';
import StatusBadge from '../../components/dashboard/StatusBadge';
import TicketDetailModal from '../../components/dashboard/TicketDetailModal';
import { adminService } from '../../services/admin.service';
import { useDebounce } from '../../hooks/useDebounce';

export default function AdminTicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500); // P3: Search Debounce
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'open', 'inprogress', 'answered', 'closed'

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getTickets({ status: statusFilter, search: debouncedSearch, page, limit: 10 });
      let filteredTickets = response.data?.tickets || [];
      
      if (response.data?.totalPages) {
        setTotalPages(response.data.totalPages);
      }
      
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
  }, [statusFilter, debouncedSearch, page, activeTab]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch, activeTab]);

  const handleUpdateTicket = async (id, data) => {
    try {
      await adminService.updateTicket(id, data);
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReplyTicket = async (id, data) => {
    try {
      await adminService.replyTicket(id, data);
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { 
      key: '_id', 
      header: 'ID', 
      renderCell: (row) => <span className="font-mono text-xs">#{row.ticketId || row._id.substring(0,6).toUpperCase()}</span> 
    },
    { 
      key: 'subject', 
      header: 'Subject', 
      sortable: true,
      renderCell: (row) => (
        <button 
          onClick={async () => {
            try {
              // Fetch full ticket details including messages and context
              const response = await adminService.getTicket(row._id);
              setSelectedTicket({ 
                ...response.data.ticket, 
                messages: response.data.messages,
                clientServices: response.data.clientServices,
                clientInvoices: response.data.clientInvoices
              });
            } catch (err) {
              console.error('Error fetching ticket details', err);
              setSelectedTicket(row); // fallback
            }
          }}
          className="text-accent hover:text-accent-hover font-medium text-left transition-colors"
        >
          {row.subject}
        </button>
      )
    },
    { 
      key: 'client', 
      header: 'Client', 
      renderCell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.client?.name || 'N/A'}</span>
          {row.client?.email && (
            <span className="text-xs text-text-muted">{row.client.email}</span>
          )}
        </div>
      )
    },
    { key: 'department', header: 'Department', sortable: true, renderCell: (row) => row.department?.name || row.department || 'General' },
    { 
      key: 'status', 
      header: 'Status', 
      sortable: true,
      renderCell: (row) => <StatusBadge status={row.status} /> 
    },
    { 
      key: 'priority', 
      header: 'Priority',
      renderCell: (row) => <StatusBadge status={row.priority} />
    },
    { 
      key: 'createdAt', 
      header: 'Created', 
      sortable: true,
      renderCell: (row) => new Date(row.createdAt).toLocaleDateString() 
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6 animate-fade-in-webgenix">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Support Tickets</h1>
          <p className="text-sm text-text-secondary">Manage and respond to client inquiries.</p>
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

      <div className="animate-slide-up-webgenix">
        <FilterBar 
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search tickets by subject or ID..."
          filters={[
            {
              key: 'status',
              label: 'All Statuses',
              value: statusFilter,
              options: [
                { label: 'Open', value: 'OPEN' },
                { label: 'In Progress', value: 'IN_PROGRESS' },
                { label: 'Resolved', value: 'RESOLVED' },
                { label: 'Closed', value: 'CLOSED' }
              ]
            }
          ]}
          onFilterChange={(key, val) => {
            if (key === 'status') setStatusFilter(val);
          }}
        />

        <DataTable 
          columns={columns} 
          data={tickets} 
          isLoading={loading} 
          pagination={{
            currentPage: page,
            totalPages: totalPages,
            onPageChange: setPage
          }}
        />
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
