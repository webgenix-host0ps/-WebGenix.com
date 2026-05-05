import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Ticket, 
  FileText, 
  Briefcase, 
  Target, 
  Settings,
  X,
  Package,
  ShoppingBag,
  Server,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

export default function DashboardSidebar({ isOpen, closeSidebar }) {
  const location = useLocation();
  const { user } = useAuth();
  
  if (!user) return null;

  const role = user.role || 'client';

  const adminLinks = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Clients', path: '/admin/clients', icon: Users },
    { label: 'Tickets', path: '/admin/tickets', icon: Ticket },
    { label: 'Invoices', path: '/admin/invoices', icon: FileText },
    { label: 'Services', path: '/admin/services', icon: Briefcase },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Leads', path: '/admin/leads', icon: Target },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const supportLinks = [
    { label: 'Overview', path: '/support', icon: LayoutDashboard },
    { label: 'Tickets Queue', path: '/support/tickets', icon: Ticket },
    { label: 'Clients', path: '/support/clients', icon: Users },
  ];

  const billingLinks = [
    { label: 'Overview', path: '/billing', icon: LayoutDashboard },
    { label: 'Invoices', path: '/billing/invoices', icon: FileText },
    { label: 'Tickets', path: '/billing/tickets', icon: Ticket },
    { label: 'Clients', path: '/billing/clients', icon: Users },
  ];

  const leadLinks = [
    { label: 'Overview', path: '/leads', icon: LayoutDashboard },
    { label: 'Pipeline', path: '/leads/pipeline', icon: Target },
  ];

  const clientLinks = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
    { label: 'My Services', path: '/my-services', icon: Server },
    { label: 'Billing', path: '/invoices', icon: CreditCard },
    { label: 'Support', path: '/tickets', icon: Ticket },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  let links = clientLinks;
  if (role === 'admin') links = adminLinks;
  else if (role === 'support') links = supportLinks;
  else if (role === 'billing') links = billingLinks;
  else if (role === 'lead') links = leadLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 lg:top-20 bottom-0 w-72 bg-dark-900 lg:bg-transparent border-r border-header-border 
        overflow-y-auto z-[80] lg:z-40 transition-all duration-500 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        custom-scrollbar
      `}>
        {/* Mobile Logo */}
        <div className="p-8 flex items-center justify-between lg:hidden border-b border-white/[0.04] mb-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-white shadow-lg shadow-accent/20">W</div>
                <span className="text-xl font-bold text-white tracking-tight">WebGenix</span>
            </div>
            <button onClick={closeSidebar} className="text-text-muted hover:text-white p-2">
                <X size={24} />
            </button>
        </div>
        
        <div className="p-6 space-y-8">
            {/* Quick Profile Section (Only in Sidebar for role identification) */}
            <div className="px-2">
                <div className="p-4 rounded-[20px] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.05] shadow-inner relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 blur-2xl rounded-full translate-x-4 -translate-y-4"></div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-dark-800 border border-header-border flex items-center justify-center text-xs font-black text-text-primary shadow-lg group-hover:border-accent/40 transition-all">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-black text-text-primary truncate uppercase tracking-widest">{user.name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <Zap size={10} className="text-accent fill-accent" />
                                <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest">{role} session</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <nav className="space-y-1.5">
                <p className="px-4 text-[10px] font-black tracking-[0.25em] text-text-muted uppercase mb-4 opacity-40">Navigation</p>
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                    
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => closeSidebar()}
                            className={`
                                relative flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group
                                ${isActive 
                                    ? 'bg-accent/10 text-accent shadow-lg shadow-accent/5' 
                                    : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'
                                }
                            `}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-accent rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                            )}
                            <Icon size={18} className={`${isActive ? 'text-accent' : 'text-text-muted group-hover:text-white transition-colors'}`} />
                            <span className="font-bold text-sm tracking-tight">{link.label}</span>
                            {isActive && <ChevronRight size={14} className="ml-auto text-accent opacity-50" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Premium Badge / Upgrade Promo */}
            {role === 'client' && (
                <div className="px-2 mt-8">
                    <div className="p-6 rounded-[28px] bg-gradient-to-br from-accent/20 to-purple-600/10 border border-accent/20 relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <ShieldCheck className="text-accent mb-4" size={28} />
                        <h4 className="text-white font-bold text-sm mb-2">Security Status</h4>
                        <p className="text-[10px] text-text-secondary leading-relaxed mb-4">Professional security is active for your account.</p>
                        <button className="w-full py-2.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors">
                            Manage Security
                        </button>
                    </div>
                </div>
            )}
        </div>
      </aside>
    </>
  );
}
