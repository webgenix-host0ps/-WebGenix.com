import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import ClientDashboard from './dashboards/ClientDashboard.jsx';
import AdminDashboard from './dashboards/AdminDashboard.jsx';
import SupportDashboard from './dashboards/SupportDashboard.jsx';

export default function Dashboard() {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    // Redirect if not logged in
    React.useEffect(() => {
        if (!isLoading && !user) {
            navigate('/login');
        }
    }, [user, isLoading, navigate]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin h-8 w-8 text-accent border-2 border-current border-t-transparent rounded-full" />
                    <p className="text-text-secondary text-sm">Loading Workspace...</p>
                </div>
            </div>
        );
    }

    // Render the correct dashboard based on role
    switch (user.role) {
        case 'admin':
        case 'lead':
            return <AdminDashboard />;
        case 'support':
        case 'billing': // Simplification: we'll group billing to use the support layout or its own if we had one
            return <SupportDashboard />;
        case 'client':
        default:
            return <ClientDashboard />;
    }
}
