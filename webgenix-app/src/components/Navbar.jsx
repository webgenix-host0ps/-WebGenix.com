import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { User, LogOut, ShoppingCart, Sun, Moon } from 'lucide-react';

const navLinks = [
  { label: 'Services', href: '/services' },
  { label: 'Products', href: '/products' },
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
  const [isLight, setIsLight] = useState(document.documentElement.classList.contains('light'));

  const toggleTheme = () => {
    const newIsLight = !isLight;
    setIsLight(newIsLight);
    if (newIsLight) {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
      setIsLight(true);
    }
  }, []);

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
      style={{
        borderBottomColor: scrolled
          ? 'color-mix(in srgb, var(--color-dark-600) 80%, transparent)'
          : 'color-mix(in srgb, var(--color-dark-600) 30%, transparent)',
      }}
    >
      <div className="container-webgenix h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group" aria-label="Webgenix home">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
          >
            W
          </div>
          <span className="text-xl font-bold tracking-tight text-text-primary">
            Web<span className="text-gradient-webgenix">genix</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10" role="navigation" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[15px] font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2.5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer rounded-xl hover:bg-dark-700"
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {isLight ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          <Link to="/products" className="p-2.5 text-text-secondary hover:text-text-primary transition-colors rounded-xl hover:bg-dark-700" title="Cart">
            <div className="relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-dark-700 transition-colors">
                <User size={18} />
                <span className="max-w-[120px] truncate">{user?.name || 'Dashboard'}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn-webgenix btn-secondary-webgenix px-5 py-2.5 text-sm flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-webgenix btn-secondary-webgenix px-5 py-2.5 text-sm">
                Log in
              </Link>
              <Link to="/signup" className="btn-webgenix btn-primary-webgenix px-6 py-2.5 text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          id="mobile-menu-toggle"
          className="md:hidden flex flex-col gap-2 p-2.5 rounded-xl cursor-pointer hover:bg-dark-700 transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileOpen}
          style={{ background: 'transparent', border: 'none' }}
        >
          <span
            className="block w-6 h-[2px] bg-text-secondary transition-all duration-300 rounded-full"
            style={{ transform: mobileOpen ? 'rotate(45deg) translateY(8px)' : 'none' }}
          />
          <span
            className="block w-6 h-[2px] bg-text-secondary transition-all duration-300 rounded-full"
            style={{ opacity: mobileOpen ? 0 : 1 }}
          />
          <span
            className="block w-6 h-[2px] bg-text-secondary transition-all duration-300 rounded-full"
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
          borderTop: mobileOpen ? '1px solid var(--color-dark-600)' : 'none',
          background: 'var(--color-dark-800)',
        }}
      >
        <div className="container-webgenix py-5 flex flex-col gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[15px] font-medium text-text-secondary hover:text-text-primary px-4 py-3 rounded-xl hover:bg-dark-700 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-4 mt-3 border-t border-dark-600">
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
