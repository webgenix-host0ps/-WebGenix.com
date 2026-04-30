import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import { adminService } from '../../services/admin.service';
import { Users, Ticket, FileText, Target } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminService.getStats();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8 animate-fade-in-webgenix">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Admin Dashboard</h1>
        <p className="text-text-secondary">Welcome back. Here's what's happening today.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-dark-800 rounded-xl border border-dark-700"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up-webgenix">
          <StatCard 
            title="Total Clients" 
            value={stats?.totalClients} 
            icon={Users} 
            trend={stats?.clientsTrend} 
            trendLabel="vs last month"
            color="accent"
          />
          <StatCard 
            title="Open Tickets" 
            value={stats?.openTickets} 
            icon={Ticket} 
            trend={stats?.ticketsTrend}
            trendLabel="vs yesterday"
            color="warning"
          />
          <StatCard 
            title="Unpaid Invoices" 
            value={stats?.unpaidInvoices} 
            icon={FileText} 
            trend={stats?.invoicesTrend}
            trendLabel="vs last month"
            color="error"
          />
          <StatCard 
            title="Active Leads" 
            value={stats?.leads} 
            icon={Target} 
            trend={stats?.leadsTrend}
            trendLabel="vs last week"
            color="success"
          />
        </div>
      )}

      {/* Placeholder for recent activity / charts */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up-webgenix delay-200">
        <div className="card-webgenix lg:col-span-2 min-h-[300px] flex items-center justify-center">
          <p className="text-text-muted">Revenue Chart Placeholder</p>
        </div>
        <div className="card-webgenix min-h-[300px] flex items-center justify-center">
          <p className="text-text-muted">System Activity Log Placeholder</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
