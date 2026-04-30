import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, LogOut, LayoutDashboard, Users, TicketIcon, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import SectionHeader from '../../components/SectionHeader.jsx';

const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard', active: true },
    { icon: Users, label: 'Manage Users', href: '/dashboard/users' },
    { icon: TicketIcon, label: 'All Tickets', href: '/tickets' },
    { icon: Settings, label: 'System Settings', href: '/dashboard/settings' },
];

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-dark-900 pt-20">
            <div className="container-webgenix py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="card-webgenix p-4 sticky top-24">
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-dark-600">
                                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-accent" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-text-primary truncate">{user.name}</p>
                                    <p className="text-xs text-text-muted uppercase tracking-wider">{user.role}</p>
                                </div>
                            </div>

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
                            <SectionHeader 
                                eyebrow="Admin Dashboard"
                                title={`Administrator Panel`}
                                align="left"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                            <div className="card-webgenix p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-accent" />
                                    </div>
                                    <span className="text-text-secondary text-sm">Total Users</span>
                                </div>
                                <p className="text-3xl font-bold text-text-primary">--</p>
                            </div>
                            <div className="card-webgenix p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                                        <TicketIcon className="w-5 h-5 text-warning" />
                                    </div>
                                    <span className="text-text-secondary text-sm">Pending Tickets</span>
                                </div>
                                <p className="text-3xl font-bold text-text-primary">--</p>
                            </div>
                        </div>

                        <div className="card-webgenix p-8 text-center border border-dashed border-dark-600">
                            <h3 className="text-lg font-medium text-text-primary mb-2">System Overview</h3>
                            <p className="text-text-secondary text-sm mb-4">More admin tools coming soon.</p>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
