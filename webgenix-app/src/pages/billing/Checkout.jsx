import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { billingService } from '../../services/billing.service';
import { authService } from '../../services/auth.service';
import { CreditCard, Lock, Check, ArrowLeft, Shield, Loader2, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [error, setError] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // Default to Razorpay
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

  // Load user data on mount
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
        // Fallback to stored user
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

  // Load Razorpay script
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
      setError('Please fill in all required fields');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setOrderProcessing(true);
    setError('');

    try {
      const orderItems = cart.map(item => ({
        productId: item._id || item.productId,
        cycle: item.pricing?.[0]?.cycle || item.cycle || 'monthly',
        quantity: item.quantity || 1,
        configuration: {}
      }));

      const response = await billingService.createOrder({
        items: orderItems,
        paymentMethod,
        promoCode: promoApplied?.code
      });

      const { invoice, order } = response.data;

      // Clear cart after successful order
      clearCart();

      if (paymentMethod === 'razorpay') {
        // Load Razorpay script if not already loaded
        if (!window.Razorpay) {
          await loadRazorpayScript();
        }
        
        if (!window.Razorpay) {
          setError('Failed to load Razorpay. Please try Bank Transfer.');
          return;
        }
        
        try {
          const razorpayOrder = await billingService.createRazorpayOrder(invoice._id);
          
          const options = {
            key: razorpayOrder.data.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: razorpayOrder.data.amount,
            currency: razorpayOrder.data.currency || 'INR',
            name: 'WebGenix',
            description: `Order #${order.orderNumber}`,
            order_id: razorpayOrder.data.orderId,
            handler: async (paymentResult) => {
              try {
                console.log('Payment success, verifying...', paymentResult);
                const verifyResponse = await billingService.verifyRazorpayPayment({
                  razorpayOrderId: razorpayOrder.data.orderId,
                  razorpayPaymentId: paymentResult.razorpay_payment_id,
                  razorpaySignature: paymentResult.razorpay_signature
                });
                console.log('Verification response:', verifyResponse);
                
                // Clear cart after successful payment
                clearCart();
                setError(''); // Clear any errors
                navigate('/order-success?status=success&orderId=' + order._id);
              } catch (err) {
                console.error('Payment verification failed:', err);
                const errorMsg = err.response?.data?.message || 'Payment verification failed. Please contact support with your Order ID.';
                setError(errorMsg);
                // Still navigate to success since payment was made, backend will reconcile
                navigate('/order-success?status=success&orderId=' + order._id + '&verified=false');
              }
            },
            prefill: {
              name: formData.name,
              email: formData.email,
              contact: formData.phone
            },
            theme: {
              color: '#3b82f6'
            },
            modal: {
              ondismiss: function() {
                console.log('Razorpay modal closed');
                setOrderProcessing(false);
              }
            }
          };

          const rzp = new window.Razorpay(options);
          
          rzp.on('payment.failed', function (response) {
            console.error('Payment failed:', response.error);
            setError(`Payment failed: ${response.error.description}`);
            setOrderProcessing(false);
          });
          
          rzp.open();
        } catch (err) {
          console.error('Razorpay error:', err);
          setError(err.response?.data?.message || 'Failed to initiate payment. Please try again.');
          setOrderProcessing(false);
        }
      } else {
        // Bank Transfer - go to instructions page
        navigate(`/order-success?orderId=${order._id}&invoiceId=${invoice._id}&total=${finalTotal.toFixed(2)}&method=offline`);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create order. Please try again.';
      setError(errorMessage);
      alert('Oops! Something went wrong.\n' + errorMessage);
    } finally {
      setOrderProcessing(false);
    }
  };

  const cartTotal = getCartTotal();
  const discount = getDiscount();
  const finalTotal = cartTotal - discount;

  return (
    <div className="min-h-screen bg-dark-900 text-text-primary py-12">
      <div className="max-w-6xl mx-auto px-6">
        <Link to="/store" className="inline-flex items-center gap-2 text-text-secondary hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} /> Back to Store
        </Link>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
              <h2 className="text-xl font-bold mb-6">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl focus:border-accent focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl focus:border-accent focus:outline-none transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-text-secondary mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl focus:border-accent focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-text-secondary mb-2">Company Name</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl focus:border-accent focus:outline-none transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-text-secondary mb-2">Billing Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Street address"
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl focus:border-accent focus:outline-none transition-colors mb-3"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="City"
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl focus:border-accent focus:outline-none transition-colors"
                    />
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      placeholder="State"
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl focus:border-accent focus:outline-none transition-colors"
                    />
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                      placeholder="Pincode"
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
              <h2 className="text-xl font-bold mb-6">Payment Method</h2>
              
              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'razorpay' 
                    ? 'border-accent bg-accent/10' 
                    : 'border-dark-600 hover:border-dark-500'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="w-5 h-5 accent-accent"
                    />
                    <div>
                      <span className="font-medium">Razorpay</span>
                      <p className="text-sm text-text-secondary">Pay securely with UPI, Cards, Net Banking</p>
                    </div>
                  </div>
                  <CreditCard className="w-6 h-6 text-text-secondary" />
                </label>

                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'offline' 
                    ? 'border-accent bg-accent/10' 
                    : 'border-dark-600 hover:border-dark-500'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="offline"
                      checked={paymentMethod === 'offline'}
                      onChange={() => setPaymentMethod('offline')}
                      className="w-5 h-5 accent-accent"
                    />
                    <div>
                      <span className="font-medium">Bank Transfer</span>
                      <p className="text-sm text-text-secondary">Pay via NEFT/RTGS/IMPS</p>
                    </div>
                  </div>
                </label>
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm text-text-secondary">
                <Lock className="w-4 h-4" />
                <span>Your payment information is encrypted and secure</span>
              </div>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.length === 0 ? (
                  <div className="text-center py-4 text-text-secondary">
                    <p>Your cart is empty</p>
                    <Link to="/dashboard/marketplace" className="text-accent text-sm hover:underline mt-2 inline-block">
                      Browse Marketplace
                    </Link>
                  </div>
                ) : (
                  cart.map((item, i) => {
                    const price = item.pricing?.[0]?.price || item.price || 0;
                    const setupFee = item.pricing?.[0]?.setupFee || item.setupFee || 0;
                    const cycle = item.pricing?.[0]?.cycle || item.cycle || 'monthly';
                    const quantity = item.quantity || 1;
                    return (
                      <div key={i} className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-text-secondary">{cycle} x{quantity}</p>
                        </div>
                        <div className="text-right">
                          <p>₹{(price * quantity).toFixed(2)}</p>
                          {setupFee > 0 && (
                            <p className="text-xs text-text-muted">+₹{setupFee} setup</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm text-text-secondary mb-2">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:border-accent focus:outline-none"
                    disabled={promoApplied}
                  />
                  <button
                    onClick={applyPromoCode}
                    disabled={promoApplied}
                    className="px-4 py-2 bg-dark-600 hover:bg-dark-500 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-error text-sm mt-2">{promoError}</p>}
                {promoApplied && (
                  <p className="text-success text-sm mt-2 flex items-center gap-1">
                    <Check size={14} /> {promoApplied.value}{promoApplied.type === 'percentage' ? '%' : '₹'} off applied!
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-dark-700 pt-4 space-y-2">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-dark-700">
                  <span>Total</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={orderProcessing || cart.length === 0 || finalTotal <= 0}
                className="w-full mt-6 py-4 bg-accent hover:bg-accent-hover disabled:bg-dark-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {orderProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : cart.length === 0 ? (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Cart Empty
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Pay ₹{finalTotal.toFixed(2)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}