// Admin Client Detail Component
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatusBadge from '../../components/dashboard/StatusBadge';
import { adminService } from '../../services/admin.service';
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Building, 
  CreditCard, Server, Receipt, Ticket, Shield,
  Lock, Ban, Edit, ExternalLink, Plus, Power, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import InvoiceFormModal from '../../components/dashboard/InvoiceFormModal';

export default function AdminClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const fetchClient = async () => {
    setLoading(true);
    try {
      const response = await adminService.getClient(id);
      setData(response.data);
      setNotes(response.data.client.notes || '');
    } catch (error) {
      console.error(error);
      toast.error('Failed to load client details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [id]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await adminService.updateUser(id, { notes });
      toast.success('Notes saved successfully');
    } catch (error) {
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await adminService.toggleUserStatus(id);
      toast.success('User status updated');
      fetchClient();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleCreateInvoice = async (invoiceData) => {
    try {
      await adminService.createInvoice({ ...invoiceData, userId: id });
      toast.success('Invoice created');
      setShowInvoiceModal(false);
      fetchClient();
    } catch (error) {
      toast.error('Failed to create invoice');
    }
  };

  const handleStatusUpdate = async (serviceId, status) => {
    const reason = window.prompt(`Reason for changing status to ${status}:`, 'Admin manual action');
    if (reason === null) return;

    try {
      await adminService.updateServiceStatus(serviceId, status, reason);
      toast.success(`Service ${status} successfully`);
      fetchClient();
    } catch (error) {
      console.error('Failed to update service status:', error);
      toast.error(`Failed to ${status} service`);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data || !data.client) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-text-primary">Client Not Found</h2>
          <button onClick={() => navigate('/admin/clients')} className="text-accent hover:underline mt-4">
            Return to Client List
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const { client, services, invoices, tickets } = data;

  const tabs = [
    { id: 'summary', label: 'Summary', icon: User },
    { id: 'services', label: `Services (${services?.length || 0})`, icon: Server },
    { id: 'invoices', label: `Invoices (${invoices?.length || 0})`, icon: Receipt },
    { id: 'tickets', label: `Tickets (${tickets?.length || 0})`, icon: Ticket },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in-webgenix">
        {/* Header section */}
        <button 
          onClick={() => navigate('/admin/clients')}
          className="flex items-center gap-2 text-text-secondary hover:text-white mb-6 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to Clients
        </button>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-dark-800 border border-header-border flex items-center justify-center text-3xl font-black text-white shadow-lg">
              {client.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-white tracking-tight">{client.name}</h1>
                <StatusBadge status={client.isActive ? 'active' : 'inactive'} />
              </div>
              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1.5"><Mail size={14} /> {client.email}</span>
                <span className="flex items-center gap-1.5"><Building size={14} /> {client.company || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-dark-800 border border-header-border hover:bg-dark-700 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2">
              <ExternalLink size={14} /> Login as Client
            </button>
            <button className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all shadow-lg flex items-center gap-2">
              <Edit size={14} /> Edit Profile
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-dark-900/50 border border-header-border p-5 rounded-2xl">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Credit Balance</p>
            <h3 className="text-2xl font-black text-green-400">${client.creditBalance?.toFixed(2) || '0.00'}</h3>
          </div>
          <div className="bg-dark-900/50 border border-header-border p-5 rounded-2xl">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Total Spent</p>
            <h3 className="text-2xl font-black text-white">${client.totalSpent?.toFixed(2) || '0.00'}</h3>
          </div>
          <div className="bg-dark-900/50 border border-header-border p-5 rounded-2xl">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Active Services</p>
            <h3 className="text-2xl font-black text-white">{services?.filter(s => s.status === 'active').length || 0}</h3>
          </div>
          <div className="bg-dark-900/50 border border-header-border p-5 rounded-2xl">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Member Since</p>
            <h3 className="text-lg font-bold text-white mt-1">{new Date(client.joinedAt).toLocaleDateString()}</h3>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-header-border overflow-x-auto pb-px">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all relative whitespace-nowrap ${
                activeTab === tab.id ? 'text-accent' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-dark-900/30 border border-header-border rounded-[24px] p-6 lg:p-8 min-h-[400px]">
          {activeTab === 'summary' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <User size={16} className="text-accent" /> Profile Information
                  </h3>
                  <div className="grid grid-cols-2 gap-y-6">
                    <div>
                      <p className="text-xs text-text-muted mb-1">Full Name</p>
                      <p className="font-medium text-white">{client.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1">Email Address</p>
                      <p className="font-medium text-white">{client.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1">Phone Number</p>
                      <p className="font-medium text-white">{client.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1">Company</p>
                      <p className="font-medium text-white">{client.company || 'Not provided'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-text-muted mb-1">Address</p>
                      <p className="font-medium text-white">{client.address || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-header-border">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Shield size={16} className="text-accent" /> Security Actions
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-dark-800 border border-header-border hover:bg-dark-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2">
                      <Lock size={14} /> Password Reset
                    </button>
                    <button onClick={handleToggleStatus} className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-xs font-bold rounded-lg transition-all flex items-center gap-2">
                      <Ban size={14} /> {client.isActive ? 'Suspend Account' : 'Unsuspend Account'}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-dark-800/50 border border-amber-500/20 rounded-xl p-5 mb-6">
                  <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-3">Admin Notes</h3>
                  <textarea 
                    className="w-full bg-dark-900 border border-header-border rounded-lg p-3 text-sm text-text-primary focus:border-amber-500 focus:outline-none min-h-[120px]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add private notes about this client..."
                  />
                  <button 
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="mt-3 w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-black uppercase tracking-widest rounded-lg transition-all"
                  >
                    {savingNotes ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Active & Pending Services</h3>
                <button className="text-xs font-bold text-accent hover:underline">Add New Service</button>
              </div>
              <div className="space-y-3">
                {services?.map(service => (
                  <div key={service._id} className="flex items-center justify-between p-4 bg-dark-800 border border-header-border rounded-xl group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-accent">
                        <Server size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1">{service.name || service.productName}</h4>
                        <p className="text-xs text-text-muted">${(service.recurringAmount || service.firstPaymentAmount || 0).toFixed(2)} / {service.cycle || service.billingCycle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-text-muted mb-1">Next Due</p>
                        <p className="text-sm font-medium text-white">{new Date(service.nextDueDate).toLocaleDateString()}</p>
                      </div>
                      <StatusBadge status={service.status} />
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {service.status === 'active' ? (
                          <button 
                            onClick={() => handleStatusUpdate(service._id, 'suspended')}
                            className="p-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-lg transition-colors" 
                            title="Suspend"
                          >
                            <Ban size={14} />
                          </button>
                        ) : service.status === 'suspended' ? (
                          <button 
                            onClick={() => handleStatusUpdate(service._id, 'active')}
                            className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors" 
                            title="Unsuspend"
                          >
                            <Power size={14} />
                          </button>
                        ) : null}
                        
                        <button 
                          onClick={() => handleStatusUpdate(service._id, 'terminated')}
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors" 
                          title="Terminate"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div>
               <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Billing History</h3>
                <button onClick={() => setShowInvoiceModal(true)} className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
                  <Plus size={14} /> Create Invoice
                </button>
              </div>
              <div className="space-y-3">
                {invoices?.map(invoice => (
                  <div key={invoice._id} className="flex items-center justify-between p-4 bg-dark-800 border border-header-border rounded-xl">
                    <div className="flex items-center gap-4">
                      <Receipt size={20} className="text-text-muted" />
                      <div>
                        <h4 className="font-mono font-bold text-white mb-1">{invoice._id}</h4>
                        <p className="text-xs text-text-muted">{new Date(invoice.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-white">${invoice.amount.toFixed(2)}</p>
                      <StatusBadge status={invoice.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div>
               <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Support History</h3>
                <button className="text-xs font-bold text-accent hover:underline">Open Ticket</button>
              </div>
              <div className="space-y-3">
                {tickets?.map(ticket => (
                  <div key={ticket._id} className="flex items-center justify-between p-4 bg-dark-800 border border-header-border rounded-xl">
                    <div>
                      <h4 className="font-bold text-white mb-1">{ticket.subject}</h4>
                      <p className="text-xs font-mono text-text-muted">#{ticket._id} • Updated {new Date(ticket.lastUpdated).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={ticket.priority} />
                      <StatusBadge status={ticket.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showInvoiceModal && (
        <InvoiceFormModal 
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          onSave={handleCreateInvoice}
          initialData={{
            clientId: id,
            items: [{ description: '', amount: 0, quantity: 1 }],
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            taxRate: 0,
            notes: ''
          }}
        />
      )}
    </DashboardLayout>
  );
}
