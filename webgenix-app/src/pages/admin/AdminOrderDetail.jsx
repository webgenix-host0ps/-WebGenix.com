import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatusBadge from '../../components/dashboard/StatusBadge';
import { adminService } from '../../services/admin.service';
import { 
  ArrowLeft, Package, User, Calendar, CreditCard, 
  ExternalLink, CheckCircle, XCircle, Clock, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await adminService.getOrder(id);
      setOrder(response.data);
    } catch (err) {
      console.error('Failed to fetch order:', err);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (window.confirm(`Are you sure you want to change order status to ${status}?`)) {
      try {
        await adminService.updateOrderStatus(id, status);
        toast.success(`Order status updated to ${status}`);
        fetchOrder();
      } catch (err) {
        toast.error('Failed to update order status');
      }
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

  if (!order) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-text-primary">Order Not Found</h2>
          <button onClick={() => navigate('/admin/orders')} className="text-accent hover:underline mt-4">
            Return to Orders
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in-webgenix">
        <button 
          onClick={() => navigate('/admin/orders')}
          className="flex items-center gap-2 text-text-secondary hover:text-white mb-6 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to Orders
        </button>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-white tracking-tight">Order #{order.orderNumber}</h1>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(order.createdAt).toLocaleString()}</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> IP: {order.clientIp || 'N/A'}</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            {order.invoiceId && (
              <Link 
                to={`/admin/invoices/${order.invoiceId?._id || order.invoiceId}`}
                className="px-4 py-2 bg-dark-800 border border-header-border hover:bg-dark-700 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2"
              >
                <CreditCard size={14} /> View Invoice
              </Link>
            )}
            <button 
              onClick={() => handleUpdateStatus('completed')}
              disabled={order.status === 'completed'}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle size={14} /> Accept Order
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-dark-900/30 border border-header-border rounded-[24px] p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Package size={16} className="text-accent" /> Order Items
              </h3>
              <div className="space-y-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="bg-dark-800/50 border border-header-border rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">{item.productName}</p>
                      <p className="text-xs text-text-muted mt-1">Cycle: {item.cycle} • {item.domain || 'No Domain'}</p>
                    </div>
                    <p className="font-black text-white">₹{item.total?.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-header-border flex justify-end">
                <div className="w-48 space-y-2">
                  <div className="flex justify-between text-sm text-text-muted">
                    <span>Subtotal</span>
                    <span>₹{order.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-text-muted">
                    <span>Discount</span>
                    <span>-₹{order.discount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-white pt-2 border-t border-white/5">
                    <span>Total</span>
                    <span>₹{order.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fraud / Security Info */}
            <div className="bg-dark-900/30 border border-header-border rounded-[24px] p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <ShieldCheck size={16} className="text-accent" /> Fraud Check & Security
              </h3>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-xs text-text-muted mb-1">Client IP Address</p>
                  <p className="font-medium text-white">{order.clientIp || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">User Agent</p>
                  <p className="font-medium text-white truncate max-w-xs" title={order.userAgent}>{order.userAgent || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Client Summary */}
            <div className="bg-dark-900/30 border border-header-border rounded-[24px] p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <User size={16} className="text-accent" /> Client Information
              </h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center text-xl font-black text-white">
                  {order.userId?.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <p className="font-bold text-white">{order.userId?.name || 'N/A'}</p>
                  <p className="text-xs text-text-muted">{order.userId?.email || 'N/A'}</p>
                </div>
              </div>
              <Link 
                to={`/admin/clients/${order.userId?._id}`}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink size={14} /> View Client Profile
              </Link>
            </div>

            {/* Order Actions */}
            <div className="bg-dark-900/30 border border-header-border rounded-[24px] p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Order Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => handleUpdateStatus('pending')}
                  className="w-full py-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Clock size={14} /> Mark Pending
                </button>
                <button 
                  onClick={() => handleUpdateStatus('cancelled')}
                  className="w-full py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <XCircle size={14} /> Cancel Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
