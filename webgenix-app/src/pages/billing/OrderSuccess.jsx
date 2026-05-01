import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Copy, 
  Building2, 
  FileText, 
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { billingService } from '../../services/billing.service';

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
      // Fetch order details
      const orderResponse = await billingService.getOrder(orderId);
      setOrder(orderResponse.data);
      
      // Fetch invoice details
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
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
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
    <div className="min-h-screen bg-dark-900 text-text-primary py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isPaymentSuccess ? 'bg-success/20' : 'bg-yellow-500/20'
          }`}>
            <CheckCircle className={`w-10 h-10 ${isPaymentSuccess ? 'text-success' : 'text-yellow-400'}`} />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isPaymentSuccess ? 'Payment Successful!' : 'Order Placed Successfully!'}
          </h1>
          <p className="text-text-secondary">
            {isPaymentSuccess 
              ? 'Thank you for your payment. Your services are now being activated.'
              : 'Thank you for your order. Your services will be activated once payment is confirmed.'}
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Order Summary</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isPaymentSuccess 
                ? 'bg-success/20 text-success' 
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {isPaymentSuccess ? 'Paid' : 'Pending Payment'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-text-secondary text-sm mb-1">Order Number</p>
              <p className="font-semibold">{order?.orderNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-text-secondary text-sm mb-1">Invoice Number</p>
              <p className="font-semibold">{invoice?.invoiceNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-text-secondary text-sm mb-1">Order Date</p>
              <p className="font-semibold">
                {order?.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-text-secondary text-sm mb-1">Total Amount</p>
              <p className="font-bold text-xl text-accent">₹{total || order?.total || 0}</p>
            </div>
          </div>

          {/* Order Items */}
          {order?.items && (
            <div className="border-t border-dark-700 pt-4">
              <h3 className="font-semibold mb-3">Items Ordered</h3>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-text-secondary">{item.cycle} billing</p>
                    </div>
                    <p className="font-semibold">₹{item.total}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Razorpay Success Message */}
        {isPaymentSuccess && (
          <div className={`rounded-2xl p-6 mb-6 ${isVerified ? 'bg-success/10 border border-success/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
            <h3 className={`text-lg font-bold mb-2 ${isVerified ? 'text-success' : 'text-yellow-400'}`}>
              {isVerified ? 'Payment Confirmed!' : 'Payment Received - Verification Pending'}
            </h3>
            <p className="text-text-secondary">
              {isVerified 
                ? 'Your payment has been successfully processed via Razorpay. Your services are now being provisioned and will be available shortly.'
                : 'Your payment was received but we encountered an issue during verification. Our team will manually verify your payment and activate your services within 24 hours. No further action needed from you.'}
            </p>
          </div>
        )}

        {/* Bank Transfer Instructions - Only for offline payments */}
        {isOffline && (
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Bank Transfer Details</h2>
              <p className="text-text-secondary text-sm">Complete your payment using the details below</p>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-medium mb-1">Important</p>
                <p className="text-sm text-text-secondary">
                  Please include your <strong>Order Number ({order?.orderNumber || 'N/A'})</strong> in the payment reference/description. 
                  This helps us match your payment quickly.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-dark-700 rounded-xl p-4">
              <p className="text-text-secondary text-sm mb-1">Account Name</p>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{bankDetails.accountName}</p>
                <button 
                  onClick={() => copyToClipboard(bankDetails.accountName, 'accountName')}
                  className="text-accent hover:text-accent-hover"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copied === 'accountName' && <span className="text-success text-xs">Copied!</span>}
            </div>

            <div className="bg-dark-700 rounded-xl p-4">
              <p className="text-text-secondary text-sm mb-1">Account Number</p>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{bankDetails.accountNumber}</p>
                <button 
                  onClick={() => copyToClipboard(bankDetails.accountNumber, 'accountNumber')}
                  className="text-accent hover:text-accent-hover"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copied === 'accountNumber' && <span className="text-success text-xs">Copied!</span>}
            </div>

            <div className="bg-dark-700 rounded-xl p-4">
              <p className="text-text-secondary text-sm mb-1">IFSC Code</p>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{bankDetails.ifscCode}</p>
                <button 
                  onClick={() => copyToClipboard(bankDetails.ifscCode, 'ifsc')}
                  className="text-accent hover:text-accent-hover"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copied === 'ifsc' && <span className="text-success text-xs">Copied!</span>}
            </div>

            <div className="bg-dark-700 rounded-xl p-4">
              <p className="text-text-secondary text-sm mb-1">Bank Name</p>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{bankDetails.bankName}</p>
                <button 
                  onClick={() => copyToClipboard(bankDetails.bankName, 'bank')}
                  className="text-accent hover:text-accent-hover"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copied === 'bank' && <span className="text-success text-xs">Copied!</span>}
            </div>

            <div className="bg-dark-700 rounded-xl p-4 md:col-span-2">
              <p className="text-text-secondary text-sm mb-1">UPI ID</p>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{bankDetails.upiId}</p>
                <button 
                  onClick={() => copyToClipboard(bankDetails.upiId, 'upi')}
                  className="text-accent hover:text-accent-hover"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copied === 'upi' && <span className="text-success text-xs">Copied!</span>}
            </div>
          </div>
        </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/invoices"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-xl font-semibold transition-colors"
          >
            <FileText className="w-5 h-5" />
            View My Invoices
          </Link>
          
          <Link
            to="/my-services?refresh=true"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold transition-colors"
          >
            Go to My Services
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-8 text-center text-text-secondary text-sm">
          <p>Need help? Contact us at <a href="mailto:support@webgenix.com" className="text-accent hover:underline">support@webgenix.com</a></p>
          <p className="mt-1">
            {isPaymentSuccess 
              ? 'Your services are being activated and will be available within a few minutes.'
              : 'Your services will be activated within 24 hours of payment confirmation.'}
          </p>
        </div>
      </div>
    </div>
  );
}
