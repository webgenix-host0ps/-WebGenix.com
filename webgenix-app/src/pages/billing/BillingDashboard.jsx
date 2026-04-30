import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import { billingService } from '../../services/billing.service';
import { DollarSign, FileText, AlertTriangle, TrendingUp } from 'lucide-react';

export default function BillingDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await billingService.getStats();
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
        <h1 className="text-3xl font-bold text-text-primary mb-2">Billing Dashboard</h1>
        <p className="text-text-secondary">Financial overview and invoice management.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-dark-800 rounded-xl border border-dark-700"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up-webgenix">
          <StatCard title="Monthly Revenue" value={`$${stats?.monthlyRevenue?.toLocaleString()}`} icon={TrendingUp} color="success" />
          <StatCard title="Outstanding Balance" value={`$${stats?.outstandingBalance?.toLocaleString()}`} icon={DollarSign} color="warning" />
          <StatCard title="Overdue Invoices" value={stats?.overdueInvoices} icon={AlertTriangle} color="error" />
          <StatCard title="Paid Today" value={stats?.paidToday} icon={FileText} color="accent" />
        </div>
      )}
    </DashboardLayout>
  );
}
