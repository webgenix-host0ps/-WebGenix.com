import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { billingService } from '../../services/billing.service';
import { authService } from '../../services/auth.service';
import { CreditCard, Lock, Check, Shield, Loader2, ShoppingCart, ChevronRight, Activity, Wallet, Building2, MapPin } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [error, setError] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await authService.getCurrentUser();
        const user = response.data || response;
        if (user) {
          setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            company: user.clientProfile?.company || '',
            address: user.clientProfile?.billingAddress?.line1 || '',
            city: user.clientProfile?.billingAddress?.city || '',
            state: user.clientProfile?.billingAddress?.state || '',
            pincode: user.clientProfile?.billingAddress?.pincode || ''
          });
        }
      } catch (err) {
        console.error('Failed to load user data:', err);
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          setFormData({
            name: storedUser.name || '',
            email: storedUser.email || '',
            phone: storedUser.phone || '',
            company: storedUser.clientProfile?.company || ''
          });
        }
      }
    };
    loadUserData();
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const getDiscount = () => {
    if (!promoApplied) return 0;
    const total = getCartTotal();
    if (promoApplied.type === 'percentage') {
      return (total * promoApplied.value) / 100;
    }
    return Math.min(promoApplied.value, total);
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    setPromoError('');
    
    try {
      const response = await billingService.validatePromoCode(promoCode);
      const data = response.data;
      
      if (data.valid) {
        setPromoApplied(data);
      } else {
        setPromoError(data.reason || 'Invalid promo code');
      }
    } catch (err) {
      setPromoError(err.response?.data?.message || 'Invalid promo code');
    }
  };

  const handleCheckout = async () => {
    if (!formData.name || !formData.email) {
      setError('Required fields: Identity & Signal Routing [Name/Email]');
      return;
    }

    if (cart.length === 0) {
      setError('Deployment queue is empty.');
      return;
    }

    setOrderProcessing(true);
    setError('');

    try {
      const orderItems = cart.map(item => ({
        productId: item.productId || item._id,
        productType: item.productType || item.type || 'hosting',
        cycle: item.cycle || 'monthly',
        quantity: item.quantity || 1,
        configuration: item.configuration || {},
        addons: item.addons || []
      }));

      const response = await billingService.createOrder({
        items: orderItems,
        paymentMethod,
        promoCode: promoApplied?.code
      });

      const { invoice, order } = response.data;
      clearCart();

      if (paymentMethod === 'razorpay') {
        if (!window.Razorpay) await loadRazorpayScript();
        
        if (!window.Razorpay) {
          setError('Failed to initialize Payment Kernel. Use Bank Transfer.');
          return;
        }
        
        try {
          const razorpayOrder = await billingService.createRazorpayOrder(invoice._id);
          
          const options = {
            key: razorpayOrder.data.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: razorpayOrder.data.amount,
            currency: razorpayOrder.data.currency || 'INR',
            name: 'WebGenix',
            description: `Provisioning ID #${order.orderNumber}`,
            order_id: razorpayOrder.data.orderId,
            handler: async (paymentResult) => {
              try {
                await billingService.verifyRazorpayPayment({
                  razorpayOrderId: razorpayOrder.data.orderId,
                  razorpayPaymentId: paymentResult.razorpay_payment_id,
                  razorpaySignature: paymentResult.razorpay_signature
                });
                clearCart();
                navigate('/order-success?status=success&orderId=' + order._id);
              } catch (err) {
                console.error('Verification failed:', err);
                navigate('/order-success?status=success&orderId=' + order._id + '&verified=false');
              }
            },
            prefill: {
              name: formData.name,
              email: formData.email,
              contact: formData.phone
            },
            theme: { color: '#3b82f6' },
            modal: {
              ondismiss: () => setOrderProcessing(false)
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } catch (err) {
          setError(err.response?.data?.message || 'Signal Error. Please try again.');
          setOrderProcessing(false);
        }
      } else {
        navigate(`/order-success?orderId=${order._id}&invoiceId=${invoice._id}&total=${finalTotal.toFixed(2)}&method=offline`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Order creation failed.');
    } finally {
      setOrderProcessing(false);
    }
  };

  const cartTotal = getCartTotal();
  const discount = getDiscount();
  const finalTotal = cartTotal - discount;

  return (
    <DashboardLayout>
      <div className="space-y-[32px] animate-in fade-in duration-700">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-4 opacity-60">
              <Link to="/marketplace" className="hover:text-white transition-colors uppercase tracking-widest">Marketplace</Link>
              <ChevronRight size={12} />
              <span className="text-accent">Checkout</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-4">
                Secure <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40 font-black">Checkout</span>
            </h1>
            <p className="text-text-secondary text-sm md:text-base max-w-2xl leading-relaxed font-medium uppercase tracking-widest opacity-60">
              Review your selected services and complete your payment to get started.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Configuration (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Identity Node */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-[40px] p-8 lg:p-12">
              <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                      <Activity size={24} />
                  </div>
                  <h2 className="text-xl font-black text-white tracking-tight uppercase">Your Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-accent transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-accent transition-all"
                    required
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Company Name (Optional)</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({...formData, company: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-accent transition-all"
                        />
                        <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                    </div>
                </div>
              </div>
            </div>

            {/* Allocation Node */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-[40px] p-8 lg:p-12">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                        <MapPin size={24} />
                    </div>
                    <h2 className="text-xl font-black text-white tracking-tight uppercase">Billing Address</h2>
                </div>
                
                <div className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Full Address</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            placeholder="Street address, apartment, etc."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-accent transition-all placeholder:opacity-20"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        placeholder="City"
                        className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-accent transition-all placeholder:opacity-20"
                        />
                        <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        placeholder="State"
                        className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-accent transition-all placeholder:opacity-20"
                        />
                        <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                        placeholder="Pin Code"
                        className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-accent transition-all placeholder:opacity-20"
                        />
                    </div>
                </div>
            </div>

            {/* Clearance Logic */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-[40px] p-8 lg:p-12">
              <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400">
                        <Wallet size={24} />
                    </div>
                    <h2 className="text-xl font-black text-white tracking-tight uppercase">Payment Method</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`flex flex-col items-start p-8 rounded-[32px] border transition-all relative overflow-hidden group ${
                  paymentMethod === 'razorpay' 
                    ? 'border-accent bg-accent/10' 
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                }`}>
                  <CreditCard className={`mb-4 transition-colors ${paymentMethod === 'razorpay' ? 'text-accent' : 'text-text-muted'}`} />
                  <span className="text-sm font-black text-white uppercase tracking-widest mb-1">Online Payment</span>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">UPI / Cards / Net Banking</p>
                  {paymentMethod === 'razorpay' && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-accent animate-pulse"></div>}
                </button>

                <button 
                  onClick={() => setPaymentMethod('offline')}
                  className={`flex flex-col items-start p-8 rounded-[32px] border transition-all relative overflow-hidden group ${
                  paymentMethod === 'offline' 
                    ? 'border-accent bg-accent/10' 
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                }`}>
                  <Building2 className={`mb-4 transition-colors ${paymentMethod === 'offline' ? 'text-accent' : 'text-text-muted'}`} />
                  <span className="text-sm font-black text-white uppercase tracking-widest mb-1">Bank Transfer</span>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">NEFT / IMPS / RTGS</p>
                  {paymentMethod === 'offline' && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-accent animate-pulse"></div>}
                </button>
              </div>

              <div className="mt-10 flex items-center gap-3 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60">
                <Lock size={14} className="text-accent" />
                <span>Secure SSL Encrypted Payment</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                <Shield size={18} />
                {error}
              </div>
            )}
          </div>

          {/* Checkout Logic (4 cols) */}
          <div className="lg:col-span-4 lg:sticky lg:top-[120px]">
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-[48px] p-8 lg:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                
                <h2 className="text-xl font-black text-white tracking-tight uppercase mb-10 flex items-center gap-3">
                    <ShoppingCart size={20} className="text-accent" />
                    Order Summary
                </h2>
              
                <div className="space-y-6 mb-10">
                    {cart.map((item, i) => (
                        <div key={i} className="flex justify-between items-start group">
                            <div>
                                <p className="text-xs font-black text-white uppercase tracking-widest mb-1 group-hover:text-accent transition-colors">{item.name}</p>
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">{item.cycle || 'Monthly'} Plan</p>
                            </div>
                            <span className="text-sm font-black text-white tracking-tighter">₹{(item.pricing?.[0]?.price || item.price || 0).toFixed(0)}</span>
                        </div>
                    ))}
                    {cart.length === 0 && (
                         <div className="text-center py-10 opacity-40">
                             <p className="text-[10px] font-black uppercase tracking-widest">Cart is empty</p>
                         </div>
                    )}
                </div>

                {/* Promo Node */}
                <div className="mb-10 p-2 bg-black/20 rounded-3xl border border-white/5">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.toUpperCase())}
                            placeholder="PROMO CODE..."
                            className="flex-1 bg-transparent px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none placeholder:opacity-20"
                            disabled={promoApplied}
                        />
                        <button
                            onClick={applyPromoCode}
                            disabled={promoApplied}
                            className="px-6 py-2 bg-white/10 hover:bg-accent text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-30"
                        >
                            {promoApplied ? 'Applied' : 'Apply'}
                        </button>
                    </div>
                    {promoError && <p className="text-red-400 text-[8px] font-black uppercase tracking-widest mt-2 px-3">{promoError}</p>}
                </div>

                {/* Calculations */}
                <div className="space-y-4 pt-8 border-t border-white/5 mb-8">
                    <div className="flex justify-between text-[10px] font-black text-text-muted uppercase tracking-widest">
                        <span>Subtotal</span>
                        <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-[10px] font-black text-green-400 uppercase tracking-widest">
                            <span>Discount Applied</span>
                            <span>-₹{discount}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-end pt-4">
                        <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Total Amount</span>
                        <span className="text-4xl font-black text-accent tracking-tighter leading-none">₹{finalTotal.toFixed(0)}</span>
                    </div>
                </div>

                <button
                    onClick={handleCheckout}
                    disabled={orderProcessing || cart.length === 0 || finalTotal <= 0}
                    className="w-full py-5 bg-accent hover:bg-accent-hover text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-accent/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                    {orderProcessing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Shield size={18} />
                            Complete Purchase
                        </>
                    )}
                </button>
            </div>
          </div>
        </div>

        <div className="h-20" />
      </div>
    </DashboardLayout>
  );
}
