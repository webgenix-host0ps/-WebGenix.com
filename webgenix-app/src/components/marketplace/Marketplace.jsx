import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Package, Check, Loader2, Server, Globe, 
  Shield, Mail, Zap, Database, Cpu, Users, Search,
  TrendingUp, Award, ZapOff, Trash2, CreditCard, ChevronRight,
  Filter, LayoutGrid, List, Activity, Sparkles, Box, ArrowRight
} from 'lucide-react';
import { billingService } from '../../services/billing.service';
import { svcService } from '../../services/svc.service';
import { useCart } from '../../context/CartContext.jsx';

const categoryConfig = {
  'Web Hosting': { icon: Server, color: 'blue', textColor: 'text-blue-400', gradient: 'from-blue-500/20 to-blue-600/10' },
  'VPS Hosting': { icon: Cpu, color: 'cyan', textColor: 'text-cyan-400', gradient: 'from-cyan-500/20 to-cyan-600/10' },
  'Domains': { icon: Globe, color: 'green', textColor: 'text-green-400', gradient: 'from-green-500/20 to-green-600/10' },
  'SSL Certificates': { icon: Shield, color: 'purple', textColor: 'text-purple-400', gradient: 'from-purple-500/20 to-purple-600/10' },
  'Email Hosting': { icon: Mail, color: 'orange', textColor: 'text-orange-400', gradient: 'from-orange-500/20 to-orange-600/10' },
  'Dedicated Servers': { icon: Database, color: 'red', textColor: 'text-red-400', gradient: 'from-red-500/20 to-red-600/10' },
  'Reseller Hosting': { icon: Users, color: 'pink', textColor: 'text-pink-400', gradient: 'from-pink-500/20 to-pink-600/10' },
  'Security': { icon: Shield, color: 'yellow', textColor: 'text-yellow-400', gradient: 'from-yellow-500/20 to-yellow-600/10' },
  'Backup': { icon: Database, color: 'indigo', textColor: 'text-indigo-400', gradient: 'from-indigo-500/20 to-indigo-600/10' },
  'Performance': { icon: Zap, color: 'teal', textColor: 'text-teal-400', gradient: 'from-teal-500/20 to-teal-600/10' },
};

const getCategoryConfig = (category) => {
  return categoryConfig[category] || { icon: Box, color: 'gray', textColor: 'text-gray-400', gradient: 'from-gray-500/20 to-gray-600/10' };
};

export default function Marketplace() {
  const { cart, addToCart: addToCartContext, removeFromCart: removeFromCartContext, getCartTotal, getCartItemCount } = useCart();
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('products');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await svcService.getWebDevServices();
      let data = [];
      if (Array.isArray(response)) data = response;
      else if (response.data && Array.isArray(response.data)) data = response.data;
      else if (response.services && Array.isArray(response.services)) data = response.services;
      setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await billingService.getProducts();
      
      let productsData = [];
      if (Array.isArray(response)) {
        productsData = response;
      } else if (response.data && Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response.products && Array.isArray(response.products)) {
        productsData = response.products;
      }
      
      setProducts(productsData);
    } catch (err) {
      setError('Could not load products. Please refresh the page.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const defaultPricing = product.pricing?.[0];
    addToCartContext(product, defaultPricing?.cycle || 'monthly');
  };

  const removeFromCart = (productId) => {
    const item = cart.find(i => (i.productId || i._id) === productId);
    removeFromCartContext(productId, item?.cycle);
  };

  const isInCart = (productId) => cart.some(item => (item.productId || item._id) === productId);

  const cartTotal = getCartTotal();

  const groupedProducts = useMemo(() => {
    return products.reduce((acc, product) => {
      const category = product.category || 'Cloud Services';
      if (!acc[category]) acc[category] = [];
      acc[category].push(product);
      return acc;
    }, {});
  }, [products]);

  const categories = useMemo(() => ['All', ...Object.keys(groupedProducts).sort()], [groupedProducts]);

  const filteredGroupedProducts = useMemo(() => {
    const result = {};
    Object.entries(groupedProducts).forEach(([category, categoryProducts]) => {
      const filtered = categoryProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      });
      if (filtered.length > 0) result[category] = filtered;
    });
    return result;
  }, [groupedProducts, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-6">
        <div className="w-12 h-12 rounded-full border-2 border-accent/20 border-t-accent animate-spin"></div>
        <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Loading Marketplace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-8 rounded-3xl flex items-center gap-4">
        <ZapOff size={24} />
        <div>
          <h3 className="font-bold text-sm">Something went wrong</h3>
          <p className="text-xs opacity-60 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-white/[0.03] border border-white/[0.06] p-8 lg:p-12 group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
              <Sparkles size={12} /> Explore Our Services
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
              Get the best for your <br/>
              <span className="text-accent">Online Business</span>
            </h2>
            <p className="text-text-secondary text-sm font-medium opacity-70 max-w-lg">
              Choose from a wide range of hosting, domains, and professional services to help your business grow.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-4">
            <div className="px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/10 transition-all" onClick={() => navigate('/checkout')}>
               <div className="flex items-center gap-3 mb-1">
                  <ShoppingCart className="text-accent" size={18} />
                  <span className="text-xl font-bold text-white tracking-tight">₹{cartTotal.toFixed(0)}</span>
               </div>
               <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{getCartItemCount()} items in cart</span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="px-8 py-4 bg-accent text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-accent/20 hover:bg-accent-hover transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              Go to Checkout
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Switcher: Products / Services */}
      <div className="flex gap-2 p-1.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
            activeTab === 'products'
              ? 'bg-accent text-white shadow-lg shadow-accent/20'
              : 'text-text-muted hover:text-white'
          }`}
        >
          <Package size={14} className="inline mr-2" />
          Products
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
            activeTab === 'services'
              ? 'bg-accent text-white shadow-lg shadow-accent/20'
              : 'text-text-muted hover:text-white'
          }`}
        >
          <Activity size={14} className="inline mr-2" />
          Services
        </button>
      </div>

      {activeTab === 'products' ? (
      /* Products View */
      <>
      {/* Categories & Search */}
      <div className="flex flex-col gap-6">
        {/* Category Pills - Improved Approach */}
        <div className="flex flex-wrap gap-2 p-2 bg-white/[0.02] border border-white/[0.06] rounded-3xl">
          {categories.map(category => {
            const config = getCategoryConfig(category);
            const Icon = config.icon;
            const isActive = selectedCategory === category;
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                  isActive
                    ? 'bg-accent text-white shadow-lg shadow-accent/20 scale-105'
                    : 'text-text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                {category !== 'All' && <Icon size={14} className={isActive ? 'text-white' : `text-${config.color}-400`} />}
                <span>{category}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search Box */}
          <div className="flex-1 relative group w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              placeholder="Search for services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 transition-all"
            />
          </div>

          {/* View Switch */}
          <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10">
              <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-md' : 'text-text-muted hover:text-white'}`}
                  title="Grid View"
              >
                  <LayoutGrid size={18} />
              </button>
              <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-md' : 'text-text-muted hover:text-white'}`}
                  title="List View"
              >
                  <List size={18} />
              </button>
          </div>
        </div>
      </div>

      {/* Service Sections */}
      {products.length === 0 ? (
        <div className="text-center py-32 bg-white/[0.01] border border-dashed border-white/10 rounded-[32px]">
          <Package className="w-12 h-12 mx-auto text-text-muted mb-4 opacity-20" />
          <h3 className="text-xl font-bold text-white mb-2">No items found</h3>
          <p className="text-text-secondary text-sm opacity-60">We couldn't find any products matching your search.</p>
        </div>
      ) : (
        <div className="space-y-16">
          {Object.entries(filteredGroupedProducts)
            .filter(([category]) => selectedCategory === 'All' || selectedCategory === category)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, categoryProducts]) => {
              const config = getCategoryConfig(category);
              const Icon = config.icon;
              
              return (
                <section key={category} className="space-y-6">
                  {/* Category Header */}
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-${config.color}-500/10 border border-${config.color}-500/20 flex items-center justify-center text-${config.color}-400`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">{category}</h3>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-50">
                        {categoryProducts.length} plans available
                      </p>
                    </div>
                    <div className="flex-1 h-px bg-white/5 ml-2"></div>
                  </div>

                  {/* Grid */}
                  <div className={viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                    : "space-y-4"
                  }>
                    {categoryProducts.map((product) => {
                      const inCart = isInCart(product._id);
                      const defaultPricing = product.pricing?.[0];
                      
                      return (
                        <div 
                          key={product._id}
                          className={`group relative bg-white/[0.02] border ${product.featured ? 'border-accent/50 bg-accent/[0.02]' : 'border-white/[0.06]'} rounded-3xl p-8 transition-all duration-300 hover:bg-white/[0.04] flex flex-col`}
                        >
                          {product.featured && (
                            <div className="absolute top-6 right-6">
                                <span className="px-2 py-0.5 rounded-md bg-accent text-white text-[9px] font-bold uppercase tracking-widest">
                                    Popular
                                </span>
                            </div>
                          )}

                          <div className="flex items-center gap-4 mb-6">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 ${product.featured ? 'bg-accent text-white' : 'bg-white/5 text-accent'}`}>
                                <Icon size={20} />
                             </div>
                             <div>
                                <p className="text-[9px] text-text-muted uppercase font-bold tracking-widest mb-0.5 opacity-60">Price Starting At</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-white">₹{defaultPricing?.price || 0}</span>
                                    <span className="text-text-muted text-[10px] font-medium opacity-60">/mo</span>
                                </div>
                             </div>
                          </div>
                          
                          <h4 className="text-lg font-bold text-white mb-2 group-hover:text-accent transition-colors">{product.name}</h4>
                          <p className="text-text-secondary text-xs leading-relaxed mb-6 line-clamp-2 opacity-70">
                            {product.description || 'Reliable hosting with great features and 24/7 expert support.'}
                          </p>

                          <div className="space-y-3 mb-8 flex-1">
                            {product.features?.slice(0, 4).map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2.5 text-[10px] font-medium text-text-secondary">
                                <Check size={14} className="text-green-500 flex-shrink-0" />
                                <span className="opacity-80 truncate">
                                    {typeof feature === 'string' ? feature : feature.name}
                                </span>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => inCart ? removeFromCart(product._id) : addToCart(product)}
                            className={`w-full py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                              inCart
                                ? 'bg-green-500 text-white'
                                : product.featured
                                    ? 'bg-accent text-white shadow-lg shadow-accent/20 hover:bg-accent-hover'
                                    : 'bg-white text-black hover:bg-gray-100'
                            }`}
                          >
                            {inCart ? (
                              <><Check size={16} /> Added to Cart</>
                            ) : (
                              <><ShoppingCart size={16} /> Add to Cart</>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
        </div>
      )}

      <div className="h-12" />
      </>
      ) : (
      /* Services View */
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Activity size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Web Development Services</h3>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-50">
              {services.length} services available
            </p>
          </div>
          <div className="flex-1 h-px bg-white/5 ml-2"></div>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-16 bg-white/[0.01] border border-dashed border-white/10 rounded-[32px]">
            <Activity className="w-12 h-12 mx-auto text-text-muted mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-white mb-2">No services yet</h3>
            <p className="text-text-secondary text-sm opacity-60">Web development services are being added.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service._id}
                className="group relative bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8 transition-all duration-300 hover:bg-white/[0.04] flex flex-col cursor-pointer"
                onClick={() => navigate(`/services/${service.slug}`)}
              >
                <h4 className="text-lg font-bold text-white mb-2 group-hover:text-accent transition-colors">{service.name}</h4>
                <p className="text-text-secondary text-xs leading-relaxed mb-6 line-clamp-2 opacity-70">
                  {service.description}
                </p>

                {service.features && (
                  <div className="space-y-3 mb-8 flex-1">
                    {service.features.slice(0, 4).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-[10px] font-medium text-text-secondary">
                        <Check size={14} className="text-green-500 flex-shrink-0" />
                        <span className="opacity-80 truncate">{typeof feature === 'string' ? feature : feature.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  {service.price > 0 && (
                    <div>
                      <p className="text-[9px] text-text-muted uppercase font-bold tracking-widest mb-0.5 opacity-60">Starting At</p>
                      <p className="text-lg font-bold text-white">₹{service.price.toLocaleString()}</p>
                    </div>
                  )}
                  <div className="ml-auto">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-xl text-[10px] font-bold uppercase tracking-widest group-hover:bg-accent group-hover:text-white transition-all">
                      Learn More <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="h-12" />
      </div>
      )}

    </div>
  );
}
