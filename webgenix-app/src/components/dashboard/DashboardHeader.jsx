import { useAuth } from '../../context/AuthContext';
import { Menu, Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardHeader({ toggleSidebar }) {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className="header-webgenix flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar} 
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-dark-700 rounded-lg md:hidden transition-colors"
        >
          <Menu size={24} />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gradient-webgenix tracking-tight">WebGenix</span>
          <span className="text-xs bg-dark-700 text-text-secondary px-2 py-1 rounded-md border border-dark-600 ml-2 hidden sm:inline-block">
            {user?.role?.toUpperCase()}
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-dark-700 rounded-lg transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full"></span>
        </button>
        
        <div className="relative group cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center text-sm font-semibold text-text-primary group-hover:border-accent transition-colors">
            {getInitials(user?.name)}
          </div>
          
          <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
            <div className="px-4 py-2 border-b border-dark-700 mb-1">
              <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
              <p className="text-xs text-text-muted truncate">{user?.email}</p>
            </div>
            <button 
              onClick={logout}
              className="w-full text-left px-4 py-2 text-sm text-error hover:bg-dark-700 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
