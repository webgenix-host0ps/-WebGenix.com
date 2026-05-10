import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatusBadge from '../../components/dashboard/StatusBadge';
import { adminService } from '../../services/admin.service';
import { 
  ArrowLeft, Receipt, User, Calendar, CreditCard, 
  ExternalLink, CheckCircle, Download, Printer, Building2, RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

export default function AdminInvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef();

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await adminService.getInvoice(id);
      setInvoice(response.data);
    } catch (err) {
      console.error('Failed to fetch invoice:', err);
      toast.error('Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (window.confirm('Mark this invoice as paid manually?')) {
      try {
        await adminService.updateInvoiceStatus(id, 'paid');
        toast.success('Invoice marked as paid');
        fetchInvoice();
      } catch (err) {
        toast.error('Failed to update invoice');
      }
    }
  };

  const handleRefund = async () => {
    const amountStr = window.prompt(`Enter amount to refund (Max: ${invoice.amountPaid}):`, invoice.amountPaid);
    if (amountStr === null) return;
    
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0 || amount > invoice.amountPaid) {
      toast.error('Invalid refund amount');
      return;
    }

    const reason = window.prompt('Reason for refund:', 'Admin manual refund');
    if (reason === null) return;

    const toCredit = window.confirm('Refund to client credit balance? (Cancel for original payment method)');

    try {
      await adminService.refundInvoice(id, { amount, reason, refundToCredit: toCredit });
      toast.success('Refund processed successfully');
      fetchInvoice();
    } catch (err) {
      toast.error('Failed to process refund');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = invoiceRef.current;
    if (!element) return;
    
    const opt = {
      margin: 0.5,
      filename: `Invoice_${invoice?._id?.slice(-8)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
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

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-text-primary">Invoice Not Found</h2>
          <button onClick={() => navigate('/admin/invoices')} className="text-accent hover:underline mt-4">
            Return to Invoices
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in-webgenix">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate('/admin/invoices')}
            className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to Invoices
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-all"
              title="Print"
            >
              <Printer size={16} />
            </button>
            <button 
              onClick={handleDownload}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-all"
              title="Download"
            >
              <Download size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-white tracking-tight">Invoice #{invoice._id?.slice(-8).toUpperCase()}</h1>
              <StatusBadge status={invoice.status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1.5"><Calendar size={14} /> Created: {new Date(invoice.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-1.5 font-bold text-amber-500"><Calendar size={14} /> Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex gap-3">
             {invoice.status !== 'paid' && invoice.status !== 'refunded' && (
              <button 
                onClick={handleMarkPaid}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all shadow-lg flex items-center gap-2"
              >
                <CheckCircle size={14} /> Mark as Paid
              </button>
            )}
            {invoice.amountPaid > 0 && invoice.status !== 'refunded' && (
              <button 
                onClick={handleRefund}
                className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2"
              >
                <RotateCcw size={14} /> Refund
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Printable Area */}
            <div 
              ref={invoiceRef}
              className="bg-dark-900/30 border border-header-border rounded-[24px] p-8 md:p-12 print:bg-white print:text-black"
            >
              <div className="flex justify-between items-start mb-12">
                 <div>
                    <h2 className="text-2xl font-black text-white print:text-black">WebGenix</h2>
                    <p className="text-xs text-text-muted print:text-gray-600 mt-1">Hosting & Cloud Solutions</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Amount Due</p>
                    <p className="text-3xl font-black text-accent print:text-black tracking-tighter">₹{invoice.total?.toFixed(2)}</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-12">
                 <div>
                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Invoice From</h3>
                    <div className="text-sm text-text-secondary print:text-gray-700">
                       <p className="font-bold text-white print:text-black">WebGenix Pvt Ltd</p>
                       <p>Tech Hub, Sector 62</p>
                       <p>Noida, UP, India</p>
                    </div>
                 </div>
                 <div>
                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Invoice To</h3>
                    <div className="text-sm text-text-secondary print:text-gray-700">
                       <p className="font-bold text-white print:text-black">{invoice.userId?.name || invoice.client?.name}</p>
                       <p>{invoice.userId?.email || invoice.client?.email}</p>
                       {invoice.userId?.address && <p>{invoice.userId.address}</p>}
                    </div>
                 </div>
              </div>

              <table className="w-full text-left border-collapse mb-12">
                 <thead>
                    <tr className="border-b border-white/10 print:border-gray-200">
                       <th className="py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Description</th>
                       <th className="py-3 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Amount</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5 print:divide-gray-100">
                    {invoice.items?.map((item, idx) => (
                       <tr key={idx}>
                          <td className="py-4">
                             <p className="text-sm font-bold text-white print:text-black">{item.description}</p>
                             {item.quantity > 1 && <p className="text-[10px] text-text-muted">Quantity: {item.quantity}</p>}
                          </td>
                          <td className="py-4 text-right text-sm font-medium text-white print:text-black">₹{item.total?.toFixed(2)}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>

              <div className="flex justify-end">
                 <div className="w-48 space-y-3">
                    <div className="flex justify-between text-xs text-text-muted">
                       <span>Subtotal</span>
                       <span>₹{invoice.subtotal?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-text-muted">
                       <span>Tax (0%)</span>
                       <span>₹0.00</span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-white pt-3 border-t border-white/10 print:text-black print:border-gray-200">
                       <span>Total</span>
                       <span>₹{invoice.total?.toFixed(2)}</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-dark-900/30 border border-header-border rounded-[24px] p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <CreditCard size={16} className="text-accent" /> Payment Details
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                   <span className="text-text-muted">Status</span>
                   <StatusBadge status={invoice.status} />
                </div>
                <div className="flex justify-between">
                   <span className="text-text-muted">Method</span>
                   <span className="text-white font-medium">{invoice.paymentMethod || 'None'}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-text-muted">Transaction ID</span>
                   <span className="text-white font-mono text-[10px]">{invoice.transactionId || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Client Context */}
            <div className="bg-dark-900/30 border border-header-border rounded-[24px] p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <User size={16} className="text-accent" /> Client
              </h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center text-lg font-black text-white">
                  {invoice.userId?.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{invoice.userId?.name || 'N/A'}</p>
                  <p className="text-[10px] text-text-muted">{invoice.userId?.email || 'N/A'}</p>
                </div>
              </div>
              <Link 
                to={`/admin/clients/${invoice.userId?._id}`}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink size={14} /> View Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
