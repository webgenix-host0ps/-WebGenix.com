import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { User, LogOut, ShoppingCart } from 'lucide-react';

const navLinks = [
  { label: 'Services', href: '/store' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const cartCount = getCartItemCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header
      className="header-webgenix"
      style={{ borderBottomColor: scrolled ? 'rgba(38,38,38,0.8)' : 'rgba(38,38,38,0.3)' }}
    >
      <div className="container-webgenix h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="Webgenix home">
          {/* Icon mark */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
          >
            W
          </div>
          <span className="text-lg font-semibold tracking-tight text-text-primary">
            Web<span className="text-gradient-webgenix">genix</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8" role="navigation" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/store" className="p-2 text-text-secondary hover:text-text-primary transition-colors" title="Cart">
            <div className="relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
                <User size={18} />
                <span className="max-w-[120px] truncate">{user?.name || 'Dashboard'}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn-webgenix btn-secondary-webgenix btn-sm-webgenix flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-webgenix btn-secondary-webgenix btn-sm-webgenix">
                Log in
              </Link>
              <Link to="/signup" className="btn-webgenix btn-primary-webgenix btn-sm-webgenix">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          id="mobile-menu-toggle"
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg cursor-pointer"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileOpen}
          style={{ background: 'transparent', border: 'none' }}
        >
          <span
            className="block w-5 h-0.5 bg-text-secondary transition-all duration-300"
            style={{ transform: mobileOpen ? 'rotate(45deg) translateY(8px)' : 'none' }}
          />
          <span
            className="block w-5 h-0.5 bg-text-secondary transition-all duration-300"
            style={{ opacity: mobileOpen ? 0 : 1 }}
          />
          <span
            className="block w-5 h-0.5 bg-text-secondary transition-all duration-300"
            style={{ transform: mobileOpen ? 'rotate(-45deg) translateY(-8px)' : 'none' }}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className="md:hidden overflow-hidden transition-all duration-300"
        style={{
          maxHeight: mobileOpen ? '400px' : '0',
          borderTop: mobileOpen ? '1px solid rgba(38,38,38,0.5)' : 'none',
          background: 'rgba(10,10,10,0.98)',
        }}
      >
        <div className="container-webgenix py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-text-secondary hover:text-text-primary px-3 py-2.5 rounded-lg hover:bg-dark-700 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-dark-600">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn-webgenix btn-secondary-webgenix btn-md-webgenix w-full" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="btn-webgenix btn-primary-webgenix btn-md-webgenix w-full"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-webgenix btn-secondary-webgenix btn-md-webgenix w-full" onClick={() => setMobileOpen(false)}>
                  Log in
                </Link>
                <Link to="/signup" className="btn-webgenix btn-primary-webgenix btn-md-webgenix w-full" onClick={() => setMobileOpen(false)}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
