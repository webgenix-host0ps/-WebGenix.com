import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { billingService } from '../../services/billing.service';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { ArrowLeft, Download, Printer, CreditCard, Building2, Shield, Loader2, CheckCircle, Clock } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const invoiceRef = useRef();

  const isDownload = searchParams.get('download') === 'true';

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await billingService.getInvoice(id);
      setInvoice(response.data);
      if (isDownload) {
        setTimeout(handleDownload, 1000);
      }
    } catch (err) {
      console.error('Failed to fetch invoice:', err);
      setError('Failed to load invoice details.');
    } finally {
      setLoading(false);
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
      filename: `Invoice_${invoice?.invoiceNumber || id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Loading Invoice Data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !invoice) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Shield className="w-12 h-12 text-red-400 mb-4 opacity-50" />
          <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Invoice Not Found</h2>
          <p className="text-text-secondary text-sm mb-6">{error || 'The requested invoice could not be located.'}</p>
          <button 
            onClick={() => navigate('/invoices')}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest transition-all"
          >
            Return to Invoices
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 print:pb-0">
        
        {/* Actions Bar - Hidden on Print */}
        <div className="flex items-center justify-between print:hidden">
          <button 
            onClick={() => navigate('/invoices')}
            className="flex items-center gap-2 text-xs font-black text-text-muted hover:text-white uppercase tracking-widest transition-colors"
          >
            <ArrowLeft size={16} /> Back to List
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all"
            >
              <Printer size={14} /> Print
            </button>
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all shadow-lg shadow-accent/20"
            >
              <Download size={14} /> Download PDF
            </button>
          </div>
        </div>

        {/* Invoice Printable Area */}
        <div 
          ref={invoiceRef}
          className="bg-dark-800 border border-header-border rounded-[32px] p-10 md:p-16 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black relative overflow-hidden"
        >
          {/* Status Ribbon */}
          <div className={`absolute top-8 right-[-40px] rotate-45 px-12 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-center shadow-xl print:hidden ${
            invoice.status === 'paid' ? 'bg-green-500 text-white' : 
            invoice.status === 'unpaid' ? 'bg-amber-500 text-white' : 
            'bg-red-500 text-white'
          }`}>
            {invoice.status}
          </div>

          <div className="flex justify-between items-start mb-16 border-b border-white/10 print:border-gray-200 pb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center font-bold text-white print:bg-black print:text-white">W</div>
                <span className="text-2xl font-black tracking-tight text-white print:text-black">WebGenix</span>
              </div>
              <div className="text-xs text-text-secondary print:text-gray-600 space-y-1">
                <p>WebGenix Hosting Solutions</p>
                <p>123 Tech Park, Innovation Valley</p>
                <p>Silicon City, SC 90210</p>
                <p>support@webgenix.com</p>
              </div>
            </div>
            
            <div className="text-right">
              <h1 className="text-4xl font-black text-text-primary print:text-black tracking-tighter mb-2">INVOICE</h1>
              <p className="text-lg font-mono font-bold text-accent print:text-gray-800 mb-6">{invoice.invoiceNumber}</p>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                <p className="text-text-muted print:text-gray-500 font-bold uppercase tracking-widest">Date:</p>
                <p className="text-white print:text-black font-medium">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                
                <p className="text-text-muted print:text-gray-500 font-bold uppercase tracking-widest">Due Date:</p>
                <p className="text-white print:text-black font-medium">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h3 className="text-[10px] font-black text-text-muted print:text-gray-500 uppercase tracking-widest mb-4">Billed To</h3>
            <div className="bg-dark-700 border border-header-border rounded-2xl p-6 print:border-none print:p-0 print:bg-transparent text-sm text-text-secondary print:text-gray-700">
              <p className="text-base font-black text-text-primary print:text-black mb-1">{invoice.client?.name || 'Valued Client'}</p>
              <p className="mb-1">{invoice.client?.email}</p>
              {invoice.client?.clientProfile?.company && <p>{invoice.client.clientProfile.company}</p>}
            </div>
          </div>

          <div className="mb-12">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 print:border-gray-300">
                  <th className="py-4 text-[10px] font-black text-text-muted print:text-gray-500 uppercase tracking-widest">Description</th>
                  <th className="py-4 text-[10px] font-black text-text-muted print:text-gray-500 uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-gray-200 text-sm">
                {invoice.items?.map((item, index) => (
                  <tr key={index}>
                    <td className="py-6">
                      <p className="font-bold text-white print:text-black">{item.description}</p>
                    </td>
                    <td className="py-6 text-right font-medium text-white print:text-black">₹{item.total?.toFixed(2) || item.amount?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-6 border-t border-white/10 print:border-gray-300">
            <div className="w-64 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted print:text-gray-500 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                <span className="text-white print:text-black font-medium">₹{invoice.subtotal?.toFixed(2) || invoice.total?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end border-t border-white/10 print:border-gray-200 pt-4">
                <span className="text-xs font-black text-white print:text-black uppercase tracking-widest">Total Due</span>
                <span className="text-3xl font-black text-accent print:text-black tracking-tighter">₹{invoice.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Payment Status / Action */}
          <div className="mt-16 pt-8 border-t border-white/5 print:hidden flex justify-between items-center">
             <div className="flex items-center gap-3">
                 {invoice.status === 'paid' ? (
                     <>
                        <CheckCircle className="text-green-400 w-6 h-6" />
                        <div>
                             <p className="text-xs font-black text-white uppercase tracking-widest">Payment Received</p>
                             <p className="text-[10px] text-text-muted">Thank you for your business.</p>
                         </div>
                      </>
                 ) : (
                     <>
                        <Clock className="text-amber-400 w-6 h-6" />
                        <div>
                            <p className="text-xs font-black text-white uppercase tracking-widest">Payment Pending</p>
                            <p className="text-[10px] text-text-muted">Please process the payment by the due date.</p>
                        </div>
                     </>
                 )}
             </div>
             
             {invoice.status !== 'paid' && (
                 <button className="px-8 py-4 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-accent/20 flex items-center gap-2">
                     <CreditCard size={16} /> Pay Now
                 </button>
             )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
