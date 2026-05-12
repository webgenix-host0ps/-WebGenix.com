import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import { billingService } from '../../services/billing.service';
import { DollarSign, FileText, AlertTriangle, TrendingUp, Activity } from 'lucide-react';

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

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '₹0';
    return '₹' + Number(val).toLocaleString('en-IN');
  };

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
          <StatCard title="Monthly Revenue" value={formatCurrency(stats?.monthlyRevenue)} icon={TrendingUp} color="success" />
          <StatCard title="Outstanding Balance" value={formatCurrency(stats?.outstandingBalance)} icon={DollarSign} color="warning" />
          <StatCard title="Overdue Invoices" value={stats?.overdueInvoices ?? 0} icon={AlertTriangle} color="error" />
          <StatCard title="Paid Today" value={stats?.paidToday ?? 0} icon={FileText} color="accent" />
        </div>
      )}
    </DashboardLayout>
  );
}
