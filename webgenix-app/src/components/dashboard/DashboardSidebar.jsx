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
  X
} from 'lucide-react';

export default function DashboardSidebar({ isOpen, closeSidebar }) {
  const location = useLocation();
  const { user } = useAuth();
  
  if (!user) return null;

  const role = user.role || 'client';

  const adminLinks = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Clients', path: '/admin/clients', icon: Users },
    { label: 'Tickets', path: '/admin/tickets', icon: Ticket },
    { label: 'Invoices', path: '/admin/invoices', icon: FileText },
    { label: 'Services', path: '/admin/services', icon: Briefcase },
    { label: 'Leads', path: '/admin/leads', icon: Target },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const supportLinks = [
    { label: 'Dashboard', path: '/support', icon: LayoutDashboard },
    { label: 'Tickets Queue', path: '/support/tickets', icon: Ticket },
    { label: 'Clients', path: '/support/clients', icon: Users },
  ];

  const billingLinks = [
    { label: 'Dashboard', path: '/billing', icon: LayoutDashboard },
    { label: 'Invoices', path: '/billing/invoices', icon: FileText },
    { label: 'Tickets', path: '/billing/tickets', icon: Ticket },
    { label: 'Clients', path: '/billing/clients', icon: Users },
  ];

  const leadLinks = [
    { label: 'Dashboard', path: '/leads', icon: LayoutDashboard },
    { label: 'Pipeline', path: '/leads/pipeline', icon: Target },
  ];

  let links = [];
  if (role === 'admin') links = adminLinks;
  else if (role === 'support') links = supportLinks;
  else if (role === 'billing') links = billingLinks;
  else if (role === 'lead') links = leadLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:fixed left-0 top-20 bottom-0 w-60 bg-dark-800 border-r border-dark-700 
        overflow-y-auto z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="p-4 flex items-center justify-between md:hidden">
          <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Menu</span>
          <button onClick={closeSidebar} className="text-text-muted hover:text-text-primary">
            <X size={20} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => closeSidebar()}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-accent/10 text-accent border border-accent/20' 
                    : 'text-text-secondary hover:bg-dark-700 hover:text-text-primary'
                  }
                `}
              >
                <Icon size={18} />
                <span className="font-medium text-sm">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
