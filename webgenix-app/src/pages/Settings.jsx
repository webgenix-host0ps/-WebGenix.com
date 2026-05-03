import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import { 
    User, Building2, MapPin, Save, Loader2, Check,
    Shield, CreditCard, Bell, 
    ChevronRight, Globe, Fingerprint, AtSign, Smartphone, Camera,
    AlertTriangle, AlertCircle
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

    useEffect(() => {
        loadUserData();
    }, []);

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
                                        className={`w-full flex items-start gap-4 p-4 rounded-2xl text-left transition-all group ${
                                            activeTab === item.id 
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
                            <div className={`p-5 rounded-[24px] flex items-center gap-3 animate-in slide-in-from-bottom-4 ${
                                message.type === 'success' 
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

                        {activeTab !== 'profile' && (
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
        </DashboardLayout>
    );
}
