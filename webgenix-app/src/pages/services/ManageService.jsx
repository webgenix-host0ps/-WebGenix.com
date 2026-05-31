import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { billingService } from '../../services/billing.service';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext.jsx';
import { getFieldsForService } from '../../utils/deliveryFields';
import {
    ArrowLeft, Server, Globe, Shield, CreditCard, RefreshCw,
    Activity, Lock, Settings, AlertCircle, CheckCircle, Save,
    Clock, Eye, EyeOff, Edit3, Package, Wrench, Info
} from 'lucide-react';

const STATUS_STYLES = {
    active: 'bg-green-500/10 text-green-400 border-green-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    suspended: 'bg-red-500/10 text-red-400 border-red-500/20',
    cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    terminated: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function ManageService() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const isStaff = ['admin', 'support', 'billing', 'lead'].includes(user?.role);
    const [service, setService] = useState(null);
    const [delivery, setDelivery] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);
    const [showPasswords, setShowPasswords] = useState({});

    const fields = service ? getFieldsForService(service) : [];

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const svcRes = await billingService.getService(id);
            setService(svcRes.data);

            if (isStaff) {
                try {
                    const delRes = await billingService.getServiceDelivery(id);
                    const map = delRes.data?.deliveryDetails || {};
                    const obj = {};
                    if (typeof map === 'object' && !Array.isArray(map)) {
                        for (const [k, v] of Object.entries(map)) {
                            obj[k] = v ?? '';
                        }
                    }
                    setDelivery(obj);
                } catch {
                    setDelivery({});
                }
            }
        } catch (err) {
            setError('Failed to load service details.');
            setService(null);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setDelivery(prev => ({ ...prev, [key]: value }));
        setSaved(false);
    };

    const handleSave = async () => {
        if (!isStaff) return;
        try {
            setSaving(true);
            setSaved(false);
            await billingService.updateServiceDelivery(id, { deliveryDetails: delivery });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError('Failed to save delivery details.');
        } finally {
            setSaving(false);
        }
    };

    const togglePassword = (key) => {
        setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-64">
                    <RefreshCw className="w-8 h-8 text-accent animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    if (error && !service) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mb-4 opacity-50" />
                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Service Not Found</h2>
                    <p className="text-text-secondary text-sm mb-6">{error}</p>
                    <button onClick={() => navigate('/my-services')}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest transition-all">
                        Return to My Services
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const isExpiring = service?.nextDueDate && new Date(service.nextDueDate) <= new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);

    return (
        <DashboardLayout>
            <div className="space-y-[32px] animate-in fade-in duration-700">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-text-muted mb-4 opacity-60">
                            <Link to="/my-services" className="hover:text-white transition-colors flex items-center gap-1">
                                <ArrowLeft size={12} /> My Services
                            </Link>
                            <span className="text-accent ml-2">Manage Plan</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-text-primary tracking-tight mb-4">
                            Manage <span className="text-accent">{service?.productName}</span>
                        </h1>
                        <p className="text-text-secondary text-sm md:text-base max-w-xl leading-relaxed">
                            {service?.domain || 'Service Management'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {isStaff && (
                            <button onClick={handleSave} disabled={saving}
                                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                    saved
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20'
                                }`}>
                                <Save size={16} />
                                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Delivery Details'}
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                        <AlertCircle size={18} className="text-red-400 shrink-0" />
                        <p className="text-sm text-red-300">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Service Info */}
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-[32px] p-8">
                            <h2 className="text-lg font-black text-text-primary uppercase tracking-widest mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                                <Server className="text-accent" size={20} /> Service Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                <div>
                                    <p className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-1">Product</p>
                                    <p className="text-sm text-text-primary font-bold flex items-center gap-2">
                                        <Package size={14} className="text-accent" />
                                        {service?.productName}
                                    </p>
                                    {service?.productId?.category && (
                                        <p className="text-[10px] text-text-muted mt-0.5 uppercase">{service.productId.category}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-1">Status</p>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                        STATUS_STYLES[service?.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                    }`}>
                                        {service?.status === 'active' ? <CheckCircle size={12} /> :
                                         service?.status === 'pending' ? <Clock size={12} /> : <AlertCircle size={12} />}
                                        {service?.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-1">Domain</p>
                                    <p className="text-sm text-text-primary font-bold flex items-center gap-2">
                                        <Globe size={14} className="text-text-muted" />
                                        {service?.domain || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-1">Billing Cycle</p>
                                    <p className="text-sm text-text-primary font-bold capitalize">{service?.cycle || 'Monthly'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-1">Amount</p>
                                    <p className="text-sm text-text-primary font-bold">${service?.recurringAmount?.toFixed(2) || '0.00'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-1">Next Due Date</p>
                                    <p className={`text-sm font-bold ${isExpiring ? 'text-amber-400' : 'text-text-primary'}`}>
                                        {service?.nextDueDate ? new Date(service.nextDueDate).toLocaleDateString() : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-1">Created</p>
                                    <p className="text-sm text-text-primary font-bold">
                                        {service?.createdAt ? new Date(service.createdAt).toLocaleDateString() : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-1">Auto Renew</p>
                                    <p className="text-sm font-bold flex items-center gap-2">
                                        <span className={service?.autoRenew !== false ? 'text-green-400' : 'text-red-400'}>
                                            {service?.autoRenew !== false ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Details — Staff editable, client view-only */}
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-[32px] p-8">
                            <h2 className="text-lg font-black text-text-primary uppercase tracking-widest mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                                <Wrench className="text-accent" size={20} /> Delivery Details
                                {isStaff && (
                                    <span className="ml-3 text-[9px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                                        {service?.status === 'active' ? 'Edit Mode' : 'Pre-provisioning'}
                                    </span>
                                )}
                                {!isStaff && (
                                    <span className="ml-3 text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                                        Read Only
                                    </span>
                                )}
                            </h2>

                            {fields.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {fields.map(field => {
                                        const value = delivery[field.key] ?? '';
                                        const isPassword = field.type === 'password';
                                        const isVisible = isPassword && showPasswords[field.key];
                                        const isTextarea = field.type === 'textarea';

                                        return (
                                            <div key={field.key} className={isTextarea ? 'md:col-span-2' : ''}>
                                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5">
                                                    {field.label}
                                                </label>
                                                <div className="relative">
                                                    {isTextarea ? (
                                                        <textarea
                                                            value={value}
                                                            onChange={e => handleChange(field.key, e.target.value)}
                                                            placeholder={field.placeholder || ''}
                                                            readOnly={!isStaff}
                                                            rows={3}
                                                            className={`w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-muted/30 focus:outline-none focus:border-accent transition-colors resize-none ${
                                                                !isStaff ? 'opacity-70 cursor-default' : ''
                                                            }`}
                                                        />
                                                    ) : (
                                                        <input
                                                            type={isPassword && !isVisible ? 'password' : 'text'}
                                                            value={value}
                                                            onChange={e => handleChange(field.key, e.target.value)}
                                                            placeholder={field.placeholder || ''}
                                                            readOnly={!isStaff}
                                                            className={`w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-muted/30 focus:outline-none focus:border-accent transition-colors ${
                                                                isPassword ? 'pr-10' : ''
                                                            } ${!isStaff ? 'opacity-70 cursor-default' : ''}`}
                                                        />
                                                    )}
                                                    {isPassword && isStaff && (
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePassword(field.key)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                                                        >
                                                            {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bg-dark-800/50 rounded-2xl p-10 text-center border border-dashed border-dark-600">
                                    <Lock className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-30" />
                                    <h3 className="text-sm font-black text-text-muted uppercase tracking-widest mb-2">
                                        Not Yet Provisioned
                                    </h3>
                                    <p className="text-text-secondary text-xs max-w-md mx-auto leading-relaxed">
                                        Delivery details will appear here once the service has been provisioned by our team.
                                        {isStaff && ' Use the fields above to enter server credentials and configuration details.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Billing Summary */}
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-[32px] p-8">
                            <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                                <CreditCard className="text-accent" size={20} /> Billing
                            </h2>
                            <div className="space-y-5">
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] text-text-muted uppercase tracking-widest font-black">Recurring</p>
                                    <p className="text-sm text-text-primary font-bold">${service?.recurringAmount?.toFixed(2) || '0.00'}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] text-text-muted uppercase tracking-widest font-black">Cycle</p>
                                    <p className="text-sm text-text-primary font-bold capitalize">{service?.cycle || '-'}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] text-text-muted uppercase tracking-widest font-black">Next Due</p>
                                    <p className={`text-sm font-bold ${isExpiring ? 'text-amber-400' : 'text-text-primary'}`}>
                                        {service?.nextDueDate ? new Date(service.nextDueDate).toLocaleDateString() : '-'}
                                    </p>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                    <p className="text-[10px] text-text-muted uppercase tracking-widest font-black">Status</p>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                                        STATUS_STYLES[service?.status] || ''
                                    }`}>
                                        {service?.status}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/5">
                                <Link to={`/my-services/${id}`}
                                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                    <Settings size={14} /> Full Service Details
                                </Link>
                            </div>
                        </div>

                        {/* Staff Actions */}
                        {isStaff && (
                            <div className="bg-white/[0.03] border border-white/[0.06] rounded-[32px] p-8">
                                <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                                    <Activity className="text-accent" size={20} /> Staff Actions
                                </h2>
                                <div className="space-y-3">
                                    <p className="text-[9px] text-text-muted uppercase tracking-widest font-black">
                                        Modify the delivery details form and click <span className="text-accent">Save</span> to update the provisioning information visible to the client.
                                    </p>
                                    <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 mt-4">
                                        <div className="flex items-start gap-3">
                                            <Info size={14} className="text-accent shrink-0 mt-0.5" />
                                            <p className="text-[10px] text-text-secondary leading-relaxed">
                                                Changes are reflected immediately. The client will see the updated details in read-only mode.
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={handleSave} disabled={saving}
                                        className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                            saved
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20'
                                        }`}>
                                        <Save size={16} />
                                        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}