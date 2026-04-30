import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Server, Globe, Shield, Mail, MoreVertical, RefreshCw, 
  AlertCircle, CheckCircle, Clock, XCircle, Loader2,
  ExternalLink, Settings
} from 'lucide-react';
import { billingService } from '../../services/billing.service';

const productIcons = {
  hosting: Server,
  domain: Globe,
  ssl: Shield,
  email: Mail,
  default: Server,
};

const statusConfig = {
  active: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Active' },
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Pending' },
  suspended: { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Suspended' },
  cancelled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Cancelled' },
  terminated: { icon: XCircle, color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Terminated' },
};

export default function MyServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await billingService.getMyServices();
      const servicesData = response.data?.services || response.data || [];
      setServices(servicesData);
    } catch (err) {
      setError('Failed to load services');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    if (filter === 'all') return true;
    return service.status === filter;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysUntilExpiry = (dateString) => {
    if (!dateString) return null;
    const expiry = new Date(dateString);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="container-webgenix py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-webgenix py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Services</h1>
          <p className="text-white/60 mt-1">Manage your active services and subscriptions</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-webgenix bg-accent hover:bg-accent/90"
        >
          Browse Marketplace
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Services', value: services.length, color: 'bg-blue-500/10 text-blue-400' },
          { label: 'Active', value: services.filter(s => s.status === 'active').length, color: 'bg-green-500/10 text-green-400' },
          { label: 'Pending', value: services.filter(s => s.status === 'pending').length, color: 'bg-yellow-500/10 text-yellow-400' },
          { label: 'Expiring Soon', value: services.filter(s => {
            const days = getDaysUntilExpiry(s.nextDueDate);
            return days !== null && days <= 30 && s.status === 'active';
          }).length, color: 'bg-orange-500/10 text-orange-400' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-dark-800 border border-white/5 rounded-xl p-4">
            <p className={`text-2xl font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</p>
            <p className="text-white/60 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'active', 'pending', 'suspended'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === status
                ? 'bg-accent text-white'
                : 'bg-dark-800 text-white/60 hover:text-white border border-white/5'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Services List */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-dark-800 rounded-xl border border-white/5">
          <Server className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {filter === 'all' ? 'No services yet' : `No ${filter} services`}
          </h3>
          <p className="text-white/60 mb-6 max-w-md mx-auto">
            {filter === 'all' 
              ? "You haven't purchased any services yet. Browse our marketplace to get started."
              : `You don't have any ${filter} services at the moment.`}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-webgenix bg-accent hover:bg-accent/90"
          >
            Browse Services
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredServices.map((service) => {
            const Icon = productIcons[service.productType] || productIcons.default;
            const status = statusConfig[service.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const daysUntilExpiry = getDaysUntilExpiry(service.nextDueDate);

            return (
              <div
                key={service._id}
                className="bg-dark-800 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Icon & Basic Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{service.productName}</h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`flex items-center gap-1 ${status.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {status.label}
                        </span>
                        <span className="text-white/40">•</span>
                        <span className="text-white/60">{service.productType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Domain/Configuration */}
                  {service.domain && (
                    <div className="text-sm">
                      <p className="text-white/40 text-xs uppercase">Domain</p>
                      <p className="text-white font-medium">{service.domain}</p>
                    </div>
                  )}

                  {/* Billing Info */}
                  <div className="text-sm">
                    <p className="text-white/40 text-xs uppercase">Next Due</p>
                    <p className={`font-medium ${
                      daysUntilExpiry !== null && daysUntilExpiry <= 7 
                        ? 'text-red-400' 
                        : daysUntilExpiry !== null && daysUntilExpiry <= 30 
                          ? 'text-yellow-400' 
                          : 'text-white'
                    }`}>
                      {formatDate(service.nextDueDate)}
                      {daysUntilExpiry !== null && (
                        <span className="text-white/50 ml-1">
                          ({daysUntilExpiry} days)
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-sm text-right">
                    <p className="text-white/40 text-xs uppercase">Recurring</p>
                    <p className="text-white font-medium">
                      ₹{service.recurringAmount?.toFixed(2)}/{service.cycle}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      title="Manage Service"
                    >
                      <Settings className="w-5 h-5 text-white/60" />
                    </button>
                    {service.status === 'active' && (
                      <button
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        title="Renew Service"
                      >
                        <RefreshCw className="w-5 h-5 text-white/60" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expiry Warning */}
                {daysUntilExpiry !== null && daysUntilExpiry <= 7 && service.status === 'active' && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 text-sm">
                      Service expires in {daysUntilExpiry} days. Renew now to avoid interruption.
                    </span>
                    <button className="ml-auto text-sm text-accent hover:underline">
                      Renew Now
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
