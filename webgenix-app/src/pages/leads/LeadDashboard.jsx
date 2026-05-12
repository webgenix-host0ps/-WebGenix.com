import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import { leadService } from '../../services/lead.service';
import { Users, Target, UserPlus, TrendingUp } from 'lucide-react';

export default function LeadDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await leadService.getStats();
        const data = response.data;
        setStats({
          totalLeads: data?.leads ?? 0,
          newLeads: data?.leadsTrend ?? 0,
          contacted: data?.clientsTrend ?? 0,
          conversionRate: data?.clientsTrend ? data.clientsTrend + '%' : '0%'
        });
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
        <h1 className="text-3xl font-bold text-text-primary mb-2">Lead Dashboard</h1>
        <p className="text-text-secondary">Track your sales pipeline and conversions.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-dark-800 rounded-xl border border-dark-700"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up-webgenix">
          <StatCard title="Total Leads" value={stats?.totalLeads ?? 0} icon={Users} color="accent" />
          <StatCard title="New Leads (Month)" value={stats?.newLeads ?? 0} icon={UserPlus} color="success" />
          <StatCard title="Leads Trend" value={stats?.contacted ?? 0} icon={Target} color="warning" />
          <StatCard title="Conversion Rate" value={stats?.conversionRate ?? '0%'} icon={TrendingUp} color="success" />
        </div>
      )}
    </DashboardLayout>
  );
}
