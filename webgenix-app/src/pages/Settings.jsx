import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import {
    User, Building2, MapPin, Save, Loader2, Check,
    Shield, CreditCard, Bell,
    ChevronRight, Globe, Fingerprint, AtSign, Smartphone, Camera,
    AlertTriangle, AlertCircle, Monitor, Clock, XCircle
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';

export default function Settings() {
    const navigate = useNavigate();
    const { user: authUser, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState('profile');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        gstin: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
    });

    const [twoFactorSetupOpen, setTwoFactorSetupOpen] = useState(false);
    const [setupData, setSetupData] = useState(null);
    const [verificationToken, setVerificationToken] = useState('');
    const [verifying, setVerifying] = useState(false);

    const [sessions, setSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);

    useEffect(() => {
        loadUserData();
    }, []);

    useEffect(() => {
        if (activeTab === 'security') {
            loadSessions();
        }
    }, [activeTab]);

    const loadSessions = async () => {
        setSessionsLoading(true);
        try {
            const res = await authService.getSessions();
            setSessions(res.data || []);
        } catch (err) {
            console.error('Failed to load sessions:', err);
        } finally {
            setSessionsLoading(false);
        }
    };

    const handleRevokeSession = async (sessionId) => {
        try {
            await authService.revokeSession(sessionId);
            setSessions(prev => prev.filter(s => s._id !== sessionId));
        } catch (err) {
            console.error('Failed to revoke session:', err);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        if (twoFactorSetupOpen && !setupData) {
            const fetchSetup = async () => {
                try {
                    const res = await authService.setup2FA();
                    setSetupData(res.data);
                } catch (err) {
                    console.error('Failed to setup 2FA:', err);
                    setTwoFactorSetupOpen(false);
                }
            };
            fetchSetup();
        }
    }, [twoFactorSetupOpen]);

    const handleVerify2FA = async () => {
        setVerifying(true);
        try {
            await authService.verify2FA(verificationToken);
            setMessage({ type: 'success', text: '2FA encryption node online.' });
            setTwoFactorSetupOpen(false);
            setSetupData(null);
            setVerificationToken('');
            loadUserData();
        } catch (err) {
            setMessage({ type: 'error', text: 'Invalid token. Verification failed.' });
        } finally {
            setVerifying(false);
        }
    };

    const loadUserData = async () => {
        try {
            setLoading(true);
            const response = await authService.getCurrentUser();
            const user = response.data?.user || response.data;

            if (user) {
                setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    company: user.clientProfile?.company || '',
                    gstin: user.clientProfile?.gstin || '',
                    address: user.clientProfile?.billingAddress?.line1 || '',
                    city: user.clientProfile?.billingAddress?.city || '',
                    state: user.clientProfile?.billingAddress?.state || '',
                    pincode: user.clientProfile?.billingAddress?.pincode || '',
                    country: user.clientProfile?.billingAddress?.country || 'India'
                });
            }
        } catch (err) {
            console.error('Failed to load user data:', err);
            const storedUser = authService.getStoredUser();
            if (storedUser) {
                setFormData(prev => ({
                    ...prev,
                    name: storedUser.name || '',
                    email: storedUser.email || '',
                    phone: storedUser.phone || '',
                    company: storedUser.clientProfile?.company || ''
                }));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const profileData = {
                name: formData.name,
                phone: formData.phone,
                clientProfile: {
                    company: formData.company,
                    gstin: formData.gstin,
                    billingAddress: {
                        line1: formData.address,
                        city: formData.city,
                        state: formData.state,
                        pincode: formData.pincode,
                        country: formData.country
                    }
                }
            };

            await authService.updateProfile(profileData);
            setMessage({ type: 'success', text: 'Settings synchronized successfully.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 4000);
        } catch (err) {
            console.error('Failed to update profile:', err);
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to sync settings' });
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#05070b] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    const menuItems = [
        { id: 'profile', label: 'Profile Settings', icon: <User size={18} />, description: 'Your personal and business identity' },
        { id: 'billing', label: 'Billing & Tax', icon: <CreditCard size={18} />, description: 'Payment methods and GST details' },
        { id: 'security', label: 'Security & Auth', icon: <Shield size={18} />, description: 'Password and account protection' },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} />, description: 'Choose what alerts you receive' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-[32px] animate-in fade-in duration-700">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-text-muted mb-4 opacity-60">
                    <Link to="/dashboard" className="hover:text-white transition-colors">Workspace</Link>
                    <ChevronRight size={12} />
                    <span className="text-accent">Identity Node</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Sidebar Navigation */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-6 lg:sticky lg:top-28">
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-[32px] p-6 shadow-xl overflow-hidden">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="relative group">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-accent/20">
                                        {getInitials(formData.name)}
                                    </div>
                                    <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-dark-800 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                                        <Camera size={12} />
                                    </button>
                                </div>
                                <div>
                                    <h3 className="font-black text-white truncate max-w-[150px]">{formData.name}</h3>
                                    <p className="text-[10px] text-text-muted uppercase font-black tracking-widest opacity-60">Master Account</p>
                                </div>
                            </div>

                            <nav className="space-y-2">
                                {menuItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-start gap-4 p-4 rounded-2xl text-left transition-all group ${activeTab === item.id
                                                ? 'bg-accent/10 border border-accent/20'
                                                : 'border border-transparent hover:bg-white/5'
                                            }`}
                                    >
                                        <div className={`mt-0.5 ${activeTab === item.id ? 'text-accent' : 'text-text-muted group-hover:text-white transition-colors'}`}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-black ${activeTab === item.id ? 'text-white' : 'text-text-secondary group-hover:text-white transition-colors'}`}>
                                                {item.label}
                                            </p>
                                            <p className="text-[10px] text-text-muted font-bold leading-relaxed mt-1 opacity-50">
                                                {item.description}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="bg-red-500/5 border border-red-500/10 rounded-[24px] p-5 flex items-center justify-between group cursor-pointer hover:bg-red-500/10 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                                    <AlertTriangle size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-red-400/80 group-hover:text-red-400">Danger Zone</span>
                            </div>
                            <ChevronRight size={14} className="text-red-500/40 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>

                    {/* Main Settings Content */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-6">

                        {message.text && (
                            <div className={`p-5 rounded-[24px] flex items-center gap-3 animate-in slide-in-from-bottom-4 ${message.type === 'success'
                                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                }`}>
                                {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                                <span className="text-sm font-black uppercase tracking-widest">{message.text}</span>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="bg-white/[0.02] border border-white/[0.06] rounded-[40px] p-8 lg:p-12 shadow-2xl">
                                <div className="flex items-center gap-5 mb-12 pb-8 border-b border-white/5">
                                    <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent border border-accent/20">
                                        <Fingerprint size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tight">Profile Synchronizer</h2>
                                        <p className="text-text-muted text-sm font-bold uppercase tracking-widest opacity-60">Update global identity and credentials</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-12">
                                    {/* Personal Identity */}
                                    <section className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Identity Core</span>
                                            <div className="h-px flex-1 bg-white/5"></div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-60">Legal Designation</label>
                                                <div className="relative group">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent transition-colors" />
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white focus:bg-white/[0.08] focus:border-accent/50 focus:outline-none transition-all placeholder:text-text-muted/30"
                                                        placeholder="e.g. John Doe"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-60">Primary Communication Node</label>
                                                <div className="relative group">
                                                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted opacity-30" />
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        disabled
                                                        className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/5 rounded-2xl text-sm text-text-muted cursor-not-allowed font-bold"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-60">Verified Cellular Signal</label>
                                                <div className="relative group">
                                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent transition-colors" />
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white focus:bg-white/[0.08] focus:border-accent/50 focus:outline-none transition-all"
                                                        placeholder="+91 90000 00000"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Business Profile */}
                                    <section className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">Business Nexus</span>
                                            <div className="h-px flex-1 bg-white/5"></div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-60">Enterprise Entity</label>
                                                <div className="relative group">
                                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-purple-400 transition-colors" />
                                                    <input
                                                        type="text"
                                                        name="company"
                                                        value={formData.company}
                                                        onChange={handleChange}
                                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white focus:bg-white/[0.08] focus:border-purple-500/50 focus:outline-none transition-all"
                                                        placeholder="WebGenix Solutions Pvt Ltd"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-60">Taxation ID (GSTIN)</label>
                                                <input
                                                    type="text"
                                                    name="gstin"
                                                    value={formData.gstin}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white font-mono focus:bg-white/[0.08] focus:border-purple-500/50 focus:outline-none transition-all uppercase placeholder:normal-case"
                                                    placeholder="27AAAAA0000A1Z5"
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Geographic Details */}
                                    <section className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Geographic Hub</span>
                                            <div className="h-px flex-1 bg-white/5"></div>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-60">Headquarters Vector</label>
                                                <div className="relative group">
                                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-blue-400 transition-colors" />
                                                    <input
                                                        type="text"
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleChange}
                                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white focus:bg-white/[0.08] focus:border-blue-500/50 focus:outline-none transition-all"
                                                        placeholder="123 Innovation Drive, Tech Park"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-60">Sector/City</label>
                                                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white focus:bg-white/[0.08] focus:border-blue-500/50 focus:outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-60">Province</label>
                                                    <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white focus:bg-white/[0.08] focus:border-blue-500/50 focus:outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-60">Signal Code</label>
                                                    <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white focus:bg-white/[0.08] focus:border-blue-500/50 focus:outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-60">Federation</label>
                                                    <div className="relative group">
                                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                                        <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white focus:bg-white/[0.08] focus:border-blue-500/50 focus:outline-none transition-all" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Action Hub */}
                                    <div className="pt-12 border-t border-white/5 flex flex-col xl:flex-row items-center justify-between gap-8">
                                        <div className="flex items-center gap-4 text-text-muted opacity-60">
                                            <Shield size={20} className="text-accent" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest max-w-sm">
                                                Synchronization will propagate your identity across all active infrastructure nodes and financial logs.
                                            </p>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full xl:w-auto flex items-center justify-center gap-4 px-12 py-5 bg-accent hover:bg-accent-hover disabled:bg-white/10 disabled:cursor-not-allowed text-white font-black uppercase tracking-[0.25em] text-[10px] rounded-[24px] transition-all shadow-2xl shadow-accent/20 hover:shadow-accent/40 active:scale-95"
                                        >
                                            {saving ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /> Synchronizing...</>
                                            ) : (
                                                <><Save size={18} /> Update Workspace Core</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="bg-white/[0.02] border border-white/[0.06] rounded-[40px] p-8 lg:p-12 shadow-2xl space-y-12">
                                <div className="flex items-center gap-5 mb-12 pb-8 border-b border-white/5">
                                    <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400 border border-red-500/20">
                                        <Shield size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tight">Security Protocols</h2>
                                        <p className="text-text-muted text-sm font-bold uppercase tracking-widest opacity-60">Manage account access and protection matrices</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* 2FA Card */}
                                    <div className={`p-8 rounded-[32px] border transition-all duration-500 ${authUser?.twoFactorEnabled ? 'bg-green-500/5 border-green-500/20' : 'bg-white/[0.03] border-white/[0.06]'}`}>
                                        <div className="flex items-center justify-between mb-8">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${authUser?.twoFactorEnabled ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-text-muted'}`}>
                                                <Smartphone size={22} />
                                            </div>
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${authUser?.twoFactorEnabled ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-text-muted'}`}>
                                                {authUser?.twoFactorEnabled ? 'Encrypted' : 'Vulnerable'}
                                            </span>
                                        </div>
                                        <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Two-Factor Authentication</h4>
                                        <p className="text-xs text-text-secondary font-medium leading-relaxed opacity-60 mb-8">
                                            Add an extra layer of security to your account by requiring a verification code from your mobile device.
                                        </p>

                                        {authUser?.twoFactorEnabled ? (
                                            <button
                                                onClick={async () => {
                                                    if (confirm('Are you sure you want to disable 2FA? This will reduce your account security level.')) {
                                                        try {
                                                            await authService.disable2FA();
                                                            setMessage({ type: 'success', text: '2FA protocol deactivated.' });
                                                            loadUserData();
                                                        } catch (err) {
                                                            setMessage({ type: 'error', text: 'Failed to deactivate 2FA.' });
                                                        }
                                                    }
                                                }}
                                                className="w-full py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-500/20 transition-all"
                                            >
                                                Deactivate 2FA
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setTwoFactorSetupOpen(true)}
                                                className="w-full py-4 rounded-2xl bg-accent text-white text-[10px] font-black uppercase tracking-widest hover:bg-accent-hover transition-all shadow-xl shadow-accent/20"
                                            >
                                                Initialize 2FA
                                            </button>
                                        )}
                                    </div>

                                    {/* Password Card */}
                                    <div className="p-8 rounded-[32px] bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-all">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-text-muted">
                                                <Fingerprint size={22} />
                                            </div>
                                        </div>
                                        <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Access Credentials</h4>
                                        <p className="text-xs text-text-secondary font-medium leading-relaxed opacity-60 mb-8">
                                            Rotate your master password periodically to maintain peak security integrity.
                                        </p>
                                        <button className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all">
                                            Rotate Password
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Active Sessions */}
                        <div className="pt-8 border-t border-white/5">
                            <div className="flex items-center gap-4 mb-8">
                                <Monitor size={20} className="text-text-muted" />
                                <h3 className="text-lg font-black text-white uppercase tracking-tight">Active Sessions</h3>
                                {sessionsLoading && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
                            </div>
                            <div className="space-y-3">
                                {sessions.length === 0 && !sessionsLoading ? (
                                    <div className="p-6 rounded-[24px] bg-white/[0.02] border border-dashed border-white/10 text-center">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">No active sessions found</p>
                                    </div>
                                ) : (
                                    sessions.map((session) => (
                                        <div key={session._id} className="flex items-center justify-between p-5 rounded-[24px] bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted">
                                                    <Monitor size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{session.device?.userAgent?.substring(0, 50) || 'Unknown Device'}</p>
                                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-60">
                                                        IP: {session.device?.ip || 'N/A'} · Last active: {formatDate(session.lastUsedAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRevokeSession(session._id)}
                                                className="p-2 rounded-xl hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                                                title="Revoke session"
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {activeTab !== 'profile' && activeTab !== 'security' && (
                            <div className="bg-white/[0.02] border border-white/[0.06] rounded-[40px] p-24 text-center shadow-2xl animate-in zoom-in-95 duration-500">
                                <div className="w-24 h-24 bg-accent/5 rounded-[32px] flex items-center justify-center text-accent mx-auto mb-10 border border-accent/10">
                                    <Shield size={44} className="opacity-30" />
                                </div>
                                <h3 className="text-4xl font-black text-white mb-6 tracking-tight">System Encryption Active</h3>
                                <p className="text-text-secondary max-w-lg mx-auto leading-relaxed font-bold uppercase tracking-widest text-[10px] opacity-60">
                                    The <span className="text-white">{activeTab}</span> module is currently locked for enterprise-grade optimization. Access will be restored upon next deployment cycle.
                                </p>
                                <button onClick={() => setActiveTab('profile')} className="mt-12 text-accent font-black text-xs uppercase tracking-[0.3em] hover:underline">
                                    Return to Master Hub
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="h-10" />
            </div>

            {/* 2FA Setup Modal */}
            {twoFactorSetupOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setTwoFactorSetupOpen(false)}></div>
                    <div className="relative bg-dark-900 border border-white/10 w-full max-w-lg rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setTwoFactorSetupOpen(false)}
                            className="absolute top-8 right-8 text-text-muted hover:text-white transition-colors"
                        >
                            <AtSign size={20} className="rotate-45" />
                        </button>

                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent border border-accent/20 mx-auto">
                                <Smartphone size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Enable 2FA Protection</h3>
                            <p className="text-text-secondary text-sm font-medium leading-relaxed">
                                Scan the QR code below with your preferred authenticator app (Google, Authy, or Microsoft).
                            </p>

                            {setupData ? (
                                <div className="space-y-8">
                                    <div className="p-4 bg-white rounded-[24px] inline-block shadow-2xl">
                                        <img src={setupData.qrCode} alt="2FA QR Code" className="w-48 h-48" />
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Enter 6-Digit Encryption Key</p>
                                        <input
                                            type="text"
                                            maxLength="6"
                                            value={verificationToken}
                                            onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, ''))}
                                            placeholder="000000"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 text-center text-2xl font-mono tracking-[0.5em] text-accent focus:outline-none focus:border-accent transition-all"
                                        />
                                        <button
                                            onClick={handleVerify2FA}
                                            disabled={verificationToken.length !== 6 || verifying}
                                            className="w-full py-5 rounded-2xl bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent-hover disabled:bg-white/10 disabled:cursor-not-allowed transition-all shadow-xl shadow-accent/20"
                                        >
                                            {verifying ? 'Verifying Node...' : 'Establish Secure Link'}
                                        </button>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-xl text-left border border-white/5">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 opacity-50">Manual Input Key</p>
                                        <code className="text-xs text-white font-mono break-all">{setupData.secret}</code>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12">
                                    <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
