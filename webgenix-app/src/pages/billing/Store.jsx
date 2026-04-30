import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { billingService } from '../../services/billing.service';
import { useCart } from '../../context/CartContext';
import { Check, Star, Info, ShoppingCart } from 'lucide-react';

export default function Store() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('solutions');
  const { cart, addToCart, removeFromCart, getCartTotal, getCartItemCount } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await billingService.getProducts({ type: 'hosting', status: 'active' });
        const allProducts = response.data || [];
        
        let filtered = allProducts;
        if (activeTab === 'solutions') {
          filtered = allProducts.filter(p => 
            p.category?.toLowerCase().includes('solution') || 
            p.type === 'service'
          );
        } else if (activeTab === 'infrastructure') {
          filtered = allProducts.filter(p => p.type === 'hosting');
        } else if (activeTab === 'upsells') {
          filtered = allProducts.filter(p => p.type === 'addon');
        } else {
          filtered = allProducts.filter(p => 
            p.category?.toLowerCase().includes('development')
          );
        }
        
        setProducts(filtered);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeTab]);

  const isInCart = (productId, cycle) => {
    return cart.some(item => item.productId === productId && item.cycle === cycle);
  };

  const tabs = [
    { id: 'solutions', label: '🚀 Solutions' },
    { id: 'infrastructure', label: '🧱 Infrastructure' },
    { id: 'web-development', label: '💻 Development' },
    { id: 'upsells', label: '⚡ Add-ons' }
  ];

  const planColors = {
    'Starter Stack': 'from-blue-500 to-cyan-400',
    'Growth Stack': 'from-purple-500 to-pink-400',
    'Shared Hosting': 'from-green-500 to-emerald-400',
    'VPS': 'from-orange-500 to-red-400'
  };

  return (
    <div className="min-h-screen bg-dark-900 text-text-primary">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-dark-800 border-b border-dark-700">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-purple-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-text-secondary bg-clip-text text-transparent">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl">
            High-performance hosting solutions designed for your success. 
            Starting at just ₹149/month.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-40 bg-dark-800/95 backdrop-blur-md border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:text-white hover:bg-dark-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="h-96 bg-dark-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Info className="w-16 h-16 mx-auto text-text-muted mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products available</h3>
            <p className="text-text-secondary">Check back soon for our hosting plans.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => {
              const defaultPricing = product.pricing?.[0];
              const gradient = planColors[product.name] || 'from-accent to-purple-500';
              
              return (
                <div 
                  key={product._id} 
                  className={`relative group bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 ${product.featured ? 'ring-2 ring-accent' : ''}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {product.featured && (
                    <div className="absolute top-4 right-4">
                      <span className="flex items-center gap-1 px-3 py-1 bg-accent text-white text-xs font-bold rounded-full">
                        <Star size={12} fill="currentColor" /> RECOMMENDED
                      </span>
                    </div>
                  )}
                  
                  <div className={`h-2 bg-gradient-to-r ${gradient}`}></div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                    <p className="text-text-secondary text-sm mb-6 line-clamp-2">
                      {product.description || 'High-performance hosting solution with all the features you need.'}
                    </p>
                    
                    <div className="mb-6">
                      <span className="text-4xl font-bold">₹{defaultPricing?.price || 0}</span>
                      <span className="text-text-secondary">/{defaultPricing?.cycle || 'month'}</span>
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      {product.features?.slice(0, 5).map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <Check className="w-5 h-5 text-success flex-shrink-0" />
                          <span className="text-text-secondary">{feature.name}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={() => isInCart(product._id, defaultPricing?.cycle) 
                        ? removeFromCart(product._id, defaultPricing?.cycle) 
                        : addToCart(product, defaultPricing?.cycle)}
                      className={`w-full py-3 rounded-xl font-semibold transition-all ${
                        isInCart(product._id, defaultPricing?.cycle)
                          ? 'bg-success text-white'
                          : product.featured
                            ? 'bg-accent hover:bg-accent-hover text-white'
                            : 'bg-dark-700 hover:bg-dark-600 text-white'
                      }`}
                    >
                      {isInCart(product._id, defaultPricing?.cycle) ? 'Added to Cart' : 'Get Started'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart */}
      {getCartItemCount() > 0 && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up-webgenix">
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-4 shadow-2xl min-w-[300px]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Your Cart
              </h4>
              <span className="text-sm text-text-secondary">{getCartItemCount()} item(s)</span>
            </div>
            <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-text-secondary truncate max-w-[150px]">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span>₹{item.price}</span>
                    <button 
                      onClick={() => removeFromCart(item.productId, item.cycle)}
                      className="text-error hover:text-red-400"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-dark-700 pt-3 mb-3">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>₹{getCartTotal()}/month</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="block w-full py-3 bg-accent hover:bg-accent-hover text-white text-center rounded-xl font-semibold transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}