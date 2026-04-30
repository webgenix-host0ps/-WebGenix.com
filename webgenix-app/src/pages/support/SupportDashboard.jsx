import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import { supportService } from '../../services/support.service';
import { Ticket, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function SupportDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await supportService.getStats();
        setStats(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8 animate-fade-in-webgenix">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Support Dashboard</h1>
        <p className="text-text-secondary">Overview of your current ticket queue.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-dark-800 rounded-xl border border-dark-700"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up-webgenix">
          <StatCard title="Open Tickets" value={stats?.openTickets} icon={Ticket} color="warning" />
          <StatCard title="My Tickets" value={stats?.myTickets} icon={AlertCircle} color="accent" />
          <StatCard title="Avg Response" value={stats?.avgResponseTime} icon={Clock} color="accent" />
          <StatCard title="Resolved Today" value={stats?.resolvedToday} icon={CheckCircle} color="success" />
        </div>
      )}
    </DashboardLayout>
  );
}
