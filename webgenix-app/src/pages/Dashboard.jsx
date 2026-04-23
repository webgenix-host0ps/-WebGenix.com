import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Shield, LogOut, LayoutDashboard, Server, CreditCard, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard', active: true },
    { icon: Server, label: 'My Services', href: '/dashboard/services' },
    { icon: CreditCard, label: 'Billing', href: '/dashboard/billing' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function Dashboard() {
    const { user, logout, isLoading } = useAuth();
    const navigate = useNavigate();

    // Redirect if not logged in
    useEffect(() => {
        if (!isLoading && !user) {
            navigate('/login');
        }
    }, [user, isLoading, navigate]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin h-8 w-8 text-accent">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
                        </svg>
                    </div>
                    <p className="text-text-secondary text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-900 pt-20">
            <div className="container-webgenix py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="card-webgenix p-4 sticky top-24">
                            {/* User info */}
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-dark-600">
                                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                                    <User className="w-6 h-6 text-accent" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-text-primary truncate">{user.name}</p>
                                    <p className="text-xs text-text-muted truncate">{user.email}</p>
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="flex flex-col gap-1">
                                {sidebarLinks.map((link) => (
                                    <Link
                                        key={link.label}
                                        to={link.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                            link.active
                                                ? 'bg-accent/10 text-accent'
                                                : 'text-text-secondary hover:text-text-primary hover:bg-dark-700'
                                        }`}
                                    >
                                        <link.icon size={18} />
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-error/80 hover:text-error hover:bg-error/10 transition-colors w-full mt-6 pt-6 border-t border-dark-600"
                            >
                                <LogOut size={18} />
                                Sign Out
                            </button>
                        </div>
                    </aside>

                    {/* Main content */}
                    <main className="flex-1">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard</h1>
                            <p className="text-text-secondary">Welcome back! Here's what's happening with your account.</p>
                        </div>

                        {/* Stats cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <div className="card-webgenix p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                        <Server className="w-5 h-5 text-accent" />
                                    </div>
                                    <span className="text-text-secondary text-sm">Active Services</span>
                                </div>
                                <p className="text-3xl font-bold text-text-primary">0</p>
                                <p className="text-xs text-text-muted mt-1">No active services</p>
                            </div>

                            <div className="card-webgenix p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-success" />
                                    </div>
                                    <span className="text-text-secondary text-sm">Account Status</span>
                                </div>
                                <p className="text-3xl font-bold text-success">Active</p>
                                <p className="text-xs text-text-muted mt-1">
                                    {user.emailVerified ? 'Email verified' : 'Email not verified'}
                                </p>
                            </div>

                            <div className="card-webgenix p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-warning" />
                                    </div>
                                    <span className="text-text-secondary text-sm">Billing</span>
                                </div>
                                <p className="text-3xl font-bold text-text-primary">₹0</p>
                                <p className="text-xs text-text-muted mt-1">No pending invoices</p>
                            </div>
                        </div>

                        {/* Profile section */}
                        <div className="card-webgenix p-6">
                            <h2 className="text-xl font-semibold text-text-primary mb-6">Profile Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs text-text-muted uppercase tracking-wider font-medium mb-2 block">
                                        Full Name
                                    </label>
                                    <div className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg border border-dark-600">
                                        <User size={18} className="text-text-muted" />
                                        <span className="text-text-primary">{user.name}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-text-muted uppercase tracking-wider font-medium mb-2 block">
                                        Email Address
                                    </label>
                                    <div className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg border border-dark-600">
                                        <Mail size={18} className="text-text-muted" />
                                        <span className="text-text-primary">{user.email}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-text-muted uppercase tracking-wider font-medium mb-2 block">
                                        Role
                                    </label>
                                    <div className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg border border-dark-600">
                                        <Shield size={18} className="text-text-muted" />
                                        <span className="text-text-primary capitalize">{user.role}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-text-muted uppercase tracking-wider font-medium mb-2 block">
                                        Member Since
                                    </label>
                                    <div className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg border border-dark-600">
                                        <span className="text-text-primary">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
