import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Copy, 
  Building2, 
  FileText, 
  ArrowRight,
  Loader2,
  AlertCircle,
  ChevronRight,
  Shield,
  Zap,
  Activity,
  Download
} from 'lucide-react';
import { billingService } from '../../services/billing.service';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [copied, setCopied] = useState('');

  const orderId = searchParams.get('orderId');
  const invoiceId = searchParams.get('invoiceId');
  const total = searchParams.get('total');
  const status = searchParams.get('status');
  const method = searchParams.get('method');
  const verified = searchParams.get('verified');
  
  const isPaymentSuccess = status === 'success';
  const isOffline = method === 'offline';
  const isVerified = verified !== 'false';

  useEffect(() => {
    if (!orderId) {
      navigate('/dashboard');
      return;
    }
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const orderResponse = await billingService.getOrder(orderId);
      setOrder(orderResponse.data);
      
      if (invoiceId) {
        const invoiceResponse = await billingService.getInvoice(invoiceId);
        setInvoice(invoiceResponse.data);
      }
    } catch (err) {
      console.error('Failed to fetch order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Synchronizing Ledger...</p>
        </div>
      </div>
    );
  }

  const bankDetails = {
    accountName: 'WebGenix Hosting Pvt Ltd',
    accountNumber: '12345678901234',
    ifscCode: 'SBIN0001234',
    bankName: 'State Bank of India',
    branch: 'Mumbai Main Branch',
    upiId: 'webgenix@upi'
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-8 animate-in fade-in duration-1000">
        
        {/* Success Header */}
        <div className="relative p-10 lg:p-14 rounded-[48px] bg-gradient-to-br from-green-500/10 via-dark-800 to-transparent border border-white/[0.06] overflow-hidden text-center lg:text-left">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/5 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
            <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center flex-shrink-0 shadow-2xl ${
                isPaymentSuccess ? 'bg-green-500/20 shadow-green-500/20' : 'bg-amber-500/20 shadow-amber-500/20'
            }`}>
                <CheckCircle className={`w-12 h-12 ${isPaymentSuccess ? 'text-green-400' : 'text-amber-400'}`} />
            </div>
            
            <div className="flex-1">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${isPaymentSuccess ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isPaymentSuccess ? 'text-green-400' : 'text-amber-400'}`}>
                        {isPaymentSuccess ? 'Transaction Verified' : 'Awaiting Capital Clearance'}
                    </span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tighter mb-4 leading-tight">
                    {isPaymentSuccess ? 'Provisioning' : 'Order'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Successful</span>
                </h1>
                <p className="text-text-secondary text-sm md:text-lg max-w-2xl leading-relaxed font-bold uppercase tracking-widest opacity-60">
                    {isPaymentSuccess 
                    ? 'Your infrastructure cluster is now being initialized and integrated into your workspace.'
                    : 'Your deployment protocol has been registered. Activate signal by completing the capital transfer.'}
                </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Order Metrics (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-[40px] p-8 lg:p-12">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                            <Activity size={20} className="text-accent" />
                            Transmission Details
                        </h2>
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                            isPaymentSuccess 
                                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                            {isPaymentSuccess ? 'Cleared' : 'Pending'}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 opacity-40">Reference Node</p>
                            <p className="text-lg font-black text-white tracking-tight">#{order?.orderNumber || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 opacity-40">Ledger Index</p>
                            <p className="text-lg font-black text-white tracking-tight">{invoice?.invoiceNumber || 'INV-PENDING'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 opacity-40">Sync Timestamp</p>
                            <p className="text-lg font-black text-white tracking-tight">
                                {order?.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 opacity-40">Capital Value</p>
                            <p className="text-2xl font-black text-accent tracking-tighter">₹{total || order?.total || 0}</p>
                        </div>
                    </div>

                    {/* Node Configuration List */}
                    {order?.items && (
                        <div className="mt-12 pt-10 border-t border-white/5 space-y-6">
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6">Allocation Table</h3>
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                            <Zap size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white uppercase tracking-widest group-hover:text-accent transition-colors">{item.productName}</p>
                                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">{item.cycle} Deployment</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-black text-white tracking-tighter">₹{item.total}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {isPaymentSuccess && (
                    <div className={`rounded-[40px] p-10 border relative overflow-hidden group ${isVerified ? 'bg-green-500/5 border-green-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                        <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2 ${isVerified ? 'bg-green-400' : 'bg-amber-400'}`}></div>
                        <h3 className={`text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-3 ${isVerified ? 'text-green-400' : 'text-amber-400'}`}>
                            <Shield size={24} />
                            {isVerified ? 'Protocol Confirmed' : 'Verification Pending'}
                        </h3>
                        <p className="text-text-secondary text-sm font-bold uppercase tracking-widest leading-relaxed opacity-70">
                            {isVerified 
                                ? 'Your transaction has been verified across the cluster. Infrastructure nodes are initializing now.'
                                : 'Payment received at terminal. Manual override verification required. Our agents will resolve this within 24 solar hours.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Support/Bank Sidebar (5 cols) */}
            <div className="lg:col-span-5 space-y-8">
                {isOffline && (
                    <div className="bg-white/[0.04] border border-white/[0.08] rounded-[48px] p-8 lg:p-10 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                        
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                                <Building2 size={24} />
                            </div>
                            <h2 className="text-lg font-black text-white tracking-tight uppercase">Bank Node</h2>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-8">
                            <div className="flex items-start gap-4">
                                <AlertCircle className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Critical Reference</p>
                                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-relaxed">
                                        Inject <strong>#{order?.orderNumber}</strong> into the payment remark field for instant synchronization.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { label: 'Account Entity', value: bankDetails.accountName, field: 'name' },
                                { label: 'Transmission Code', value: bankDetails.accountNumber, field: 'acc' },
                                { label: 'IFSC Protocol', value: bankDetails.ifscCode, field: 'ifsc' },
                                { label: 'Bank Node', value: bankDetails.bankName, field: 'bank' },
                                { label: 'UPI Frequency', value: bankDetails.upiId, field: 'upi' }
                            ].map((detail, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 group hover:bg-white/10 transition-all">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">{detail.label}</p>
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-xs font-black text-white uppercase tracking-widest truncate">{detail.value}</p>
                                        <button 
                                            onClick={() => copyToClipboard(detail.value, detail.field)}
                                            className="p-2 text-text-muted hover:text-accent transition-colors"
                                        >
                                            <Copy size={14} className={copied === detail.field ? 'text-green-400' : ''} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation Actions */}
                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/my-services?refresh=true')}
                        className="w-full py-5 bg-white text-black rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        Access My Workspace
                        <ArrowRight size={18} />
                    </button>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Link
                            to="/invoices"
                            className="py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[9px] font-black text-white text-center uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            <FileText size={14} />
                            Ledger
                        </Link>
                        <button
                            className="py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[9px] font-black text-white text-center uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            <Download size={14} />
                            Export
                        </button>
                    </div>
                </div>

                <div className="p-8 bg-accent/5 border border-accent/10 rounded-[32px] text-center">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Need Technical Assistance?</p>
                    <a href="mailto:support@webgenix.com" className="text-xs font-black text-accent uppercase tracking-widest hover:underline">support@webgenix.com</a>
                </div>
            </div>
        </div>

        <div className="h-10" />
      </div>
    </DashboardLayout>
  );
}

