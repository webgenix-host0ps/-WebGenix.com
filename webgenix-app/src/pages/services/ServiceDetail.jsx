import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { billingService } from '../../services/billing.service';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { ArrowLeft, Server, Globe, Shield, CreditCard, RefreshCw, Activity, Lock, Settings, AlertCircle, CheckCircle } from 'lucide-react';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      // Currently using getMyServices and filtering. In a real app, there would be a getService(id) endpoint.
      const response = await billingService.getMyServices();
      const services = response.data?.services || response.data || [];
      const found = services.find(s => s._id === id);
      setService(found);
    } catch (error) {
      console.error('Failed to fetch service details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = () => {
    // In WHMCS, this goes to a renewal invoice generation or checkout.
    // For now, we can redirect to a hypothetical renewal checkout or show an alert.
    alert('Renewal process initiated. You will be redirected to the invoice soon.');
  };

  const handleCancellation = async () => {
    if (service.cancellationRequestedAt) {
      alert('Cancellation has already been requested for this service.');
      return;
    }

    const reason = window.prompt('Please enter the reason for cancellation:');
    if (reason === null) return;
    if (!reason.trim()) {
      alert('A reason is required for cancellation.');
      return;
    }

    const type = window.confirm('Would you like to cancel immediately? (Cancel for End of Billing Period)') 
      ? 'immediate' 
      : 'end_of_billing_period';

    try {
      await billingService.requestCancellation(id, { type, reason });
      alert('Cancellation request submitted successfully.');
      fetchService();
    } catch (error) {
      console.error('Failed to request cancellation:', error);
      alert('Failed to submit cancellation request.');
    }
  };

  const isExpiring = service?.nextDueDate && new Date(service.nextDueDate) <= new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="w-8 h-8 text-accent animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!service) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4 opacity-50" />
          <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Service Not Found</h2>
          <p className="text-text-secondary text-sm mb-6">The requested service could not be located.</p>
          <button 
            onClick={() => navigate('/services')}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest transition-all"
          >
            Return to Services
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-[32px] animate-in fade-in duration-700">
        
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-text-muted mb-4 opacity-60">
              <Link to="/services" className="hover:text-white transition-colors flex items-center gap-1"><ArrowLeft size={12} /> My Services</Link>
              <span className="text-accent ml-2">Service Management</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-text-primary tracking-tight mb-4">
              Manage <span className="text-accent">{service.productName}</span>
            </h1>
            <p className="text-text-secondary text-sm md:text-base max-w-xl leading-relaxed">
              {service.domain || 'Service Details'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {service.status !== 'active' && (
                <button 
                onClick={handleRenew}
                className="px-6 py-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
                >
                <CreditCard size={16} /> Renew Plan
                </button>
            )}
            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2">
              <Settings size={16} /> Options
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-[32px] p-8">
                    <h2 className="text-lg font-black text-text-primary uppercase tracking-widest mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                        <Server className="text-accent" size={20} /> Service Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                        <div>
                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-1">Registration Date</p>
                            <p className="text-sm text-text-primary font-bold">{new Date(service.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-1">Product/Service</p>
                            <p className="text-sm text-text-primary font-bold">{service.productName}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-1">Domain</p>
                            <p className="text-sm text-text-primary font-bold">{service.domain || '-'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-1">Status</p>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                service.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                service.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                                'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                                {service.status === 'active' ? <CheckCircle size={12} /> : service.status === 'pending' ? <Clock size={12} /> : <AlertCircle size={12} />}
                                {service.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-[32px] p-8">
                    <h2 className="text-lg font-black text-text-primary uppercase tracking-widest mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                        <Lock className="text-accent" size={20} /> Login Details
                    </h2>
                    
                    <div className="bg-black/20 rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center">
                        <Lock className="text-text-muted mb-4 opacity-50 w-12 h-12" />
                        <p className="text-text-secondary text-sm">Control panel login details will be available here once the service is fully provisioned and integrated with the relevant server modules.</p>
                    </div>
                </div>
            </div>

            {/* Billing Info */}
            <div className="space-y-8">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-[32px] p-8">
                    <h2 className="text-lg font-black text-text-primary uppercase tracking-widest mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                        <CreditCard className="text-accent" size={20} /> Billing Details
                    </h2>
                    
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-black">Billing Cycle</p>
                            <p className="text-sm text-text-primary font-bold capitalize">{service.cycle || 'Monthly'}</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-black">Recurring Amount</p>
                            <p className="text-sm text-text-primary font-bold">₹{service.recurringAmount?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-black">Next Due Date</p>
                            <p className={`text-sm font-bold ${isExpiring ? 'text-amber-400' : 'text-text-primary'}`}>
                                {service.nextDueDate ? new Date(service.nextDueDate).toLocaleDateString() : '-'}
                            </p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-black">Payment Method</p>
                            <p className="text-sm text-text-primary font-bold">{service.paymentMethod || 'Default'}</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5">
                        <button 
                            onClick={handleRenew}
                            className="w-full py-4 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-accent/20 flex justify-center items-center gap-2"
                        >
                            <CreditCard size={16} /> Renew Now
                        </button>
                    </div>
                </div>
                
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-[32px] p-8">
                    <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                        <Activity className="text-accent" size={20} /> Quick Actions
                    </h2>
                    <div className="space-y-3">
                        <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest transition-all">
                            Change Password
                        </button>
                        <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest transition-all">
                            Upgrade/Downgrade
                        </button>
                        <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest transition-all">
                            Upgrade/Downgrade Options
                        </button>
                        <button 
                          onClick={handleCancellation}
                          disabled={!!service.cancellationRequestedAt}
                          className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all mt-4 ${
                            service.cancellationRequestedAt 
                            ? 'bg-white/5 text-text-muted cursor-not-allowed' 
                            : 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                          }`}
                        >
                            {service.cancellationRequestedAt ? 'Cancellation Pending' : 'Request Cancellation'}
                        </button>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
