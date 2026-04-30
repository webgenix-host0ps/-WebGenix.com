import { Link, useNavigate } from 'react-router-dom';
import { Shield, LogOut, LayoutDashboard, TicketIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import SectionHeader from '../../components/SectionHeader.jsx';

export default function SupportDashboard() {
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
                                <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors bg-accent/10 text-accent">
                                    <LayoutDashboard size={18} />
                                    Overview
                                </Link>
                                <Link to="/tickets" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-text-secondary hover:text-text-primary hover:bg-dark-700">
                                    <TicketIcon size={18} />
                                    Manage Tickets
                                </Link>
                            </nav>
                            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-error/80 hover:text-error hover:bg-error/10 transition-colors w-full mt-6 pt-6 border-t border-dark-600">
                                <LogOut size={18} />
                                Sign Out
                            </button>
                        </div>
                    </aside>
                    <main className="flex-1">
                        <SectionHeader eyebrow="Support Dashboard" title="Support Team Workspace" align="left" />
                        <div className="card-webgenix p-8 text-center border border-dashed border-dark-600 mt-8">
                            <TicketIcon className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
                            <h3 className="text-lg font-medium text-text-primary mb-2">Welcome Support Agent</h3>
                            <p className="text-text-secondary text-sm mb-4">Please head over to the Tickets tab to resolve customer issues.</p>
                            <Link to="/tickets" className="btn-webgenix btn-primary-webgenix py-2 px-6 inline-flex items-center gap-2">
                                Go to Tickets
                            </Link>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
