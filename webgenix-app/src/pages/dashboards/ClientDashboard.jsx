import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { User, Mail, Shield, LogOut, LayoutDashboard, Server, CreditCard, Settings, TicketIcon, Plus, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getTickets } from '../../services/ticket.service';
import TicketCard from '../../components/tickets/TicketCard.jsx';
import SectionHeader from '../../components/SectionHeader.jsx';
import Marketplace from '../../components/marketplace/Marketplace.jsx';

const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Overview', tab: 'overview' },
    { icon: ShoppingBag, label: 'Marketplace', tab: 'marketplace' },
    { icon: Server, label: 'My Services', tab: 'my-services' },
    { icon: CreditCard, label: 'Billing', tab: 'billing' },
    { icon: TicketIcon, label: 'Support Tickets', tab: 'tickets' },
    { icon: Settings, label: 'Settings', tab: 'settings' },
];

export default function ClientDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [activeTab, setActiveTab] = useState('overview');
    const [recentTickets, setRecentTickets] = useState([]);
    const [stats, setStats] = useState({ open: 0, total: 0 });

    useEffect(() => {
        const path = location.pathname;
        if (path === '/dashboard' || path === '/dashboard/') {
            setActiveTab('overview');
        } else if (path.includes('marketplace')) {
            setActiveTab('marketplace');
        } else if (path.includes('my-services')) {
            setActiveTab('my-services');
        } else if (path.includes('billing')) {
            setActiveTab('billing');
        } else if (path.includes('settings')) {
            setActiveTab('settings');
        }
    }, [location]);

    useEffect(() => {
        if (user) {
            const fetchDashboardData = async () => {
                try {
                    const response = await getTickets({ limit: 5 });
                    // ticket.service returns backend response directly: { success, data: tickets[], meta }
                    const tickets = response.data || [];
                    setRecentTickets(tickets);
                    
                    const openTickets = tickets.filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length;
                    setStats({ open: openTickets, total: response.meta?.total || tickets.length });
                } catch (err) {
                    console.error('Failed to fetch dashboard data', err);
                }
            };
            fetchDashboardData();
        }
    }, [user]);

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
                                    <User className="w-6 h-6 text-accent" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-text-primary truncate">{user.name}</p>
                                    <p className="text-xs text-text-muted truncate">Client</p>
                                </div>
                            </div>

                            <nav className="flex flex-col gap-1">
                                {sidebarLinks.map((link) => {
                                    const href = link.tab === 'overview' ? '/dashboard' : 
                                                 link.tab === 'tickets' ? '/tickets' :
                                                 link.tab === 'billing' ? '/billing' :
                                                 link.tab === 'my-services' ? '/my-services' :
                                                 link.tab === 'settings' ? '/settings' :
                                                 `/dashboard/${link.tab}`;
                                    return (
                                        <Link
                                            key={link.label}
                                            to={href}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                                activeTab === link.tab
                                                    ? 'bg-accent/10 text-accent'
                                                    : 'text-text-secondary hover:text-text-primary hover:bg-dark-700'
                                            }`}
                                        >
                                            <link.icon size={18} />
                                            {link.label}
                                        </Link>
                                    );
                                })}
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
                        {/* Tab Content */}
                        {activeTab === 'marketplace' ? (
                            <Marketplace />
                        ) : activeTab === 'my-services' ? (
                            <Navigate to="/my-services" replace />
                        ) : activeTab === 'billing' ? (
                            <Navigate to="/billing" replace />
                        ) : activeTab === 'tickets' ? (
                            <Navigate to="/tickets" replace />
                        ) : (
                        <>
                        <div className="mb-8">
                            <SectionHeader 
                                eyebrow="Client Dashboard"
                                title={`Welcome back, ${user.name.split(' ')[0]}`}
                                align="left"
                            />
                        </div>

                        {/* Stats cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                            <div className="card-webgenix p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                        <TicketIcon className="w-5 h-5 text-accent" />
                                    </div>
                                    <span className="text-text-secondary text-sm">Open Tickets</span>
                                </div>
                                <p className="text-3xl font-bold text-text-primary">{stats.open}</p>
                                <p className="text-xs text-text-muted mt-1">Active support requests</p>
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

                        {/* Recent Tickets Section */}
                        <div className="mb-10">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-text-primary">Recent Support Tickets</h2>
                                <button 
                                    onClick={() => navigate('/tickets/new')}
                                    className="btn-webgenix btn-primary-webgenix py-2 px-4 flex items-center gap-2 text-sm"
                                >
                                    <Plus size={16} />
                                    Create New Ticket
                                </button>
                            </div>
                            
                            {recentTickets.length > 0 ? (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    {recentTickets.map(ticket => (
                                        <TicketCard 
                                            key={ticket._id} 
                                            ticket={ticket} 
                                            onClick={() => navigate(`/tickets/${ticket._id}`)} 
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="card-webgenix p-8 text-center border border-dashed border-dark-600">
                                    <TicketIcon className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
                                    <h3 className="text-lg font-medium text-text-primary mb-2">No tickets yet</h3>
                                    <p className="text-text-secondary text-sm mb-4">If you need help, don't hesitate to open a support ticket.</p>
                                </div>
                            )}
                            
                            {recentTickets.length > 0 && (
                                <div className="mt-6 text-center">
                                    <Link to="/tickets" className="text-accent hover:text-accent-hover text-sm font-medium transition-colors">
                                        View All Tickets →
                                    </Link>
                                </div>
                            )}
                        </div>
                        </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
