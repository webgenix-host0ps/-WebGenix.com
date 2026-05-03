import { useAuth } from '../../context/AuthContext';
import { Menu, Bell, User, Search, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function DashboardHeader({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-background-header backdrop-blur-xl border-b border-border-default z-[60] flex items-center justify-between px-6 lg:px-10">
      <div className="flex items-center gap-6">
        <button 
          onClick={toggleSidebar} 
          className="p-2.5 text-text-secondary hover:text-text-primary hover:bg-background-hover rounded-xl lg:hidden transition-all"
        >
          <Menu size={22} />
        </button>
        
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-lg shadow-accent/20 group-hover:shadow-accent/40 transition-all">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 hidden sm:block">WebGenix</span>
        </Link>

        <div className="h-6 w-px bg-white/[0.06] hidden lg:block mx-2"></div>
        
        <div className="hidden lg:flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent bg-accent/10 px-2.5 py-1 rounded-lg border border-accent/20">
                {user?.role}
            </span>
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <div className="hidden md:flex relative group w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-text-muted/50 focus:outline-none focus:border-accent/30 focus:bg-white/[0.05] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <button className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-text-muted hover:text-white transition-all relative group">
            <Bell size={18} className="group-hover:scale-110 transition-transform" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-[#050711]"></span>
          </button>
        </div>

        <div className="h-8 w-px bg-white/[0.06] hidden sm:block"></div>

        <div className="relative group">
          <button className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-white/[0.03] transition-all">
            <div className="w-9 h-9 rounded-xl bg-dark-700 border border-white/[0.06] flex items-center justify-center text-sm font-bold text-white shadow-lg group-hover:border-accent/50 transition-all">
              {getInitials(user?.name)}
            </div>
            <div className="text-left hidden lg:block pr-2">
              <p className="text-xs font-bold text-white line-clamp-1">{user?.name}</p>
              <p className="text-[9px] text-text-muted font-black uppercase tracking-widest">User Account</p>
            </div>
          </button>
          
          <div className="absolute right-0 mt-2 w-56 bg-dark-800 border border-header-border rounded-2xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right translate-y-1 group-hover:translate-y-0 z-[70] backdrop-blur-2xl">
            <div className="px-5 py-4 border-b border-white/[0.04] mb-2">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-text-muted truncate mt-0.5">{user?.email}</p>
            </div>
            
            <Link to="/settings" className="flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-text-secondary hover:text-white hover:bg-white/[0.03] transition-all">
              <Settings size={16} /> Settings
            </Link>
            <Link to="/dashboard" className="flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-text-secondary hover:text-white hover:bg-white/[0.03] transition-all">
              <LayoutDashboard size={16} /> Dashboard
            </Link>
            
            <div className="h-px bg-white/[0.04] my-2"></div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-3 text-xs font-bold text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
