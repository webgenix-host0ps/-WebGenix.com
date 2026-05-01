import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, Check, Loader2, Server, Globe, Shield, Mail, Zap, Database, Cpu, Users, Search } from 'lucide-react';
import { billingService } from '../../services/billing.service';
import { useCart } from '../../context/CartContext.jsx';

const categoryConfig = {
  'Web Hosting': { icon: Server, color: 'bg-blue-500', textColor: 'text-blue-400', gradient: 'from-blue-500/20 to-blue-600/10' },
  'VPS Hosting': { icon: Cpu, color: 'bg-cyan-500', textColor: 'text-cyan-400', gradient: 'from-cyan-500/20 to-cyan-600/10' },
  'Domains': { icon: Globe, color: 'bg-green-500', textColor: 'text-green-400', gradient: 'from-green-500/20 to-green-600/10' },
  'SSL Certificates': { icon: Shield, color: 'bg-purple-500', textColor: 'text-purple-400', gradient: 'from-purple-500/20 to-purple-600/10' },
  'Email Hosting': { icon: Mail, color: 'bg-orange-500', textColor: 'text-orange-400', gradient: 'from-orange-500/20 to-orange-600/10' },
  'Dedicated Servers': { icon: Database, color: 'bg-red-500', textColor: 'text-red-400', gradient: 'from-red-500/20 to-red-600/10' },
  'Reseller Hosting': { icon: Users, color: 'bg-pink-500', textColor: 'text-pink-400', gradient: 'from-pink-500/20 to-pink-600/10' },
  'Security': { icon: Shield, color: 'bg-yellow-500', textColor: 'text-yellow-400', gradient: 'from-yellow-500/20 to-yellow-600/10' },
  'Backup': { icon: Database, color: 'bg-indigo-500', textColor: 'text-indigo-400', gradient: 'from-indigo-500/20 to-indigo-600/10' },
  'Performance': { icon: Zap, color: 'bg-teal-500', textColor: 'text-teal-400', gradient: 'from-teal-500/20 to-teal-600/10' },
};

const getCategoryConfig = (category) => {
  return categoryConfig[category] || { icon: Package, color: 'bg-gray-500', textColor: 'text-gray-400', gradient: 'from-gray-500/20 to-gray-600/10' };
};

export default function Marketplace() {
  const { cart, addToCart: addToCartContext, removeFromCart: removeFromCartContext, getCartTotal, getCartItemCount } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

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
      setError('Failed to load products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    addToCartContext(product);
  };

  const removeFromCart = (productId) => {
    removeFromCartContext(productId);
  };

  const isInCart = (productId) => cart.some(item => (item.productId || item._id) === productId);

  const cartTotal = getCartTotal();

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {});

  // Get all categories
  const categories = ['All', ...Object.keys(groupedProducts).sort()];

  // Filter products based on selected category and search
  const getFilteredProducts = (categoryProducts) => {
    return categoryProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Marketplace</h2>
          <p className="text-white/60 mt-1">Professional hosting and business services</p>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="flex items-center gap-2 btn-webgenix bg-accent hover:bg-accent/90 self-start lg:self-auto"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Cart ({getCartItemCount()})</span>
          {getCartItemCount() > 0 && (
            <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
              ₹{cartTotal.toFixed(2)}
            </span>
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-dark-800 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-accent/50"
        />
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="bg-dark-800 border border-accent/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-medium flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-accent" />
              Cart Summary
            </span>
            <button 
              onClick={() => navigate('/checkout')}
              className="text-accent text-sm hover:underline font-medium"
            >
              View Cart →
            </button>
          </div>
          <div className="space-y-2">
            {cart.slice(0, 3).map(item => (
              <div key={item._id} className="flex items-center justify-between text-sm">
                <span className="text-white/70">{item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}</span>
                <span className="text-white">₹{(item.price * (item.quantity || 1)).toFixed(2)}</span>
              </div>
            ))}
            {cart.length > 3 && (
              <p className="text-white/50 text-sm">+{cart.length - 3} more items</p>
            )}
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => {
          const config = getCategoryConfig(category);
          const Icon = config.icon;
          const isActive = selectedCategory === category;
          const count = category === 'All' 
            ? products.length 
            : (groupedProducts[category]?.length || 0);
          
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-accent text-white'
                  : 'bg-dark-800 text-white/70 hover:text-white hover:bg-dark-700 border border-white/5'
              }`}
            >
              {category !== 'All' && <Icon className="w-4 h-4" />}
              <span>{category}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-dark-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Products by Category */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-dark-800 rounded-xl border border-white/5">
          <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 text-lg">No products available</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedProducts)
            .filter(([category]) => selectedCategory === 'All' || selectedCategory === category)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, categoryProducts]) => {
              const filteredProducts = getFilteredProducts(categoryProducts);
              if (filteredProducts.length === 0) return null;
              
              const config = getCategoryConfig(category);
              const Icon = config.icon;
              const featuredProduct = filteredProducts.find(p => p.featured);
              const regularProducts = filteredProducts.filter(p => !p.featured);
              
              return (
                <section key={category} className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                    <div className={`w-12 h-12 rounded-xl ${config.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">{category}</h3>
                      <p className="text-white/50 text-sm">
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'plan' : 'plans'} available
                      </p>
                    </div>
                  </div>

                  {/* Featured Product (if any) */}
                  {featuredProduct && (
                    <div className="bg-gradient-to-r from-accent/20 to-accent/5 border border-accent/30 rounded-xl p-6 relative overflow-hidden">
                      <div className="absolute top-4 right-4">
                        <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                          MOST POPULAR
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-2xl font-bold text-white mb-2">{featuredProduct.name}</h4>
                          <p className="text-white/70 mb-4">{featuredProduct.description}</p>
                          <ul className="space-y-2">
                            {featuredProduct.features?.slice(0, 4).map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm text-white/80">
                                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                                {typeof feature === 'string' ? feature : feature.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-col justify-center items-start md:items-end gap-4">
                          <div className="text-right">
                            <span className="text-4xl font-bold text-white">
                              ₹{(featuredProduct.pricing?.[0]?.price || 0).toFixed(0)}
                            </span>
                            <span className="text-white/50">/{featuredProduct.pricing?.[0]?.cycle || 'mo'}</span>
                          </div>
                          {isInCart(featuredProduct._id) ? (
                            <button
                              onClick={() => removeFromCart(featuredProduct._id)}
                              className="btn-webgenix bg-red-500/20 text-red-400 hover:bg-red-500/30 px-8"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => addToCart(featuredProduct)}
                              className="btn-webgenix bg-accent hover:bg-accent/90 px-8 py-3 text-lg"
                            >
                              Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Regular Products Grid */}
                  {regularProducts.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {regularProducts.map(product => {
                        const inCart = isInCart(product._id);
                        
                        return (
                          <div 
                            key={product._id}
                            className="bg-dark-800 border border-white/5 rounded-xl p-5 hover:border-accent/30 hover:bg-dark-750 transition-all group flex flex-col"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <h4 className="text-lg font-semibold text-white">{product.name}</h4>
                              {product.featured && (
                                <span className="bg-accent/20 text-accent text-xs font-bold px-2 py-1 rounded-full">
                                  POPULAR
                                </span>
                              )}
                            </div>
                            
                            <p className="text-white/60 text-sm mb-4 line-clamp-2 flex-1">
                              {product.description || 'No description available'}
                            </p>

                            {product.features && product.features.length > 0 && (
                              <ul className="space-y-1.5 mb-4">
                                {product.features.slice(0, 3).map((feature, idx) => (
                                  <li key={idx} className="flex items-center gap-2 text-sm text-white/70">
                                    <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                                    <span className="truncate">{typeof feature === 'string' ? feature : feature.name}</span>
                                  </li>
                                ))}
                              </ul>
                            )}

                            <div className="pt-4 border-t border-white/5 mt-auto">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-2xl font-bold text-white">
                                    ₹{(product.pricing?.[0]?.price || 0).toFixed(0)}
                                  </span>
                                  <span className="text-white/50 text-sm">/{product.pricing?.[0]?.cycle || 'mo'}</span>
                                </div>
                                
                                {inCart ? (
                                  <button
                                    onClick={() => removeFromCart(product._id)}
                                    className="btn-webgenix bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm px-4 py-2"
                                  >
                                    Remove
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => addToCart(product)}
                                    className="btn-webgenix bg-accent hover:bg-accent/90 text-sm px-4 py-2"
                                  >
                                    Add to Cart
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
        </div>
      )}
    </div>
  );
}
