import React, { useState, useEffect } from 'react';
import { 
    Settings, Globe, CreditCard, Shield, Mail, 
    MessageSquare, Save, RefreshCw, AlertCircle, CheckCircle2
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { getSystemSettings, updateSystemSettings } from '../../services/adminSettings.service';
import toast from 'react-hot-toast';

const SETTING_GROUPS = [
    { id: 'GENERAL', label: 'General', icon: Globe },
    { id: 'BILLING', label: 'Billing', icon: CreditCard },
    { id: 'SECURITY', label: 'Security', icon: Shield },
    { id: 'EMAIL', label: 'Email', icon: Mail },
    { id: 'TICKETING', label: 'Ticketing', icon: MessageSquare },
];

export default function AdminSettings() {
    const [activeGroup, setActiveGroup] = useState('GENERAL');
    const [settings, setSettings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            const response = await getSystemSettings();
            setSettings(response.data);
            
            // Initialize form data
            const initialData = {};
            response.data.forEach(s => {
                initialData[s.key] = s.value;
            });
            setFormData(initialData);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const settingsToUpdate = Object.entries(formData).map(([key, value]) => ({
                key,
                value
            }));
            
            await updateSystemSettings(settingsToUpdate);
            toast.success('Settings updated successfully');
            await fetchSettings();
        } catch (error) {
            console.error('Failed to update settings:', error);
            toast.error('Failed to update settings');
        } finally {
            setIsSaving(false);
        }
    };

    const groupSettings = settings.filter(s => s.group === activeGroup);

    return (
        <DashboardLayout>
            <div className="space-y-[32px] animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-2">
                            System Settings
                        </h1>
                        <p className="text-text-muted font-bold uppercase tracking-[0.2em] text-[10px]">
                            Global Configuration & Core Protocols
                        </p>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-4 bg-accent hover:bg-accent/80 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-accent/20"
                    >
                        {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                        Save Configurations
                    </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    {/* Navigation Sidebar */}
                    <div className="xl:col-span-3 space-y-2">
                        {SETTING_GROUPS.map(group => (
                            <button
                                key={group.id}
                                onClick={() => setActiveGroup(group.id)}
                                className={`w-full flex items-center gap-4 px-6 py-5 rounded-[24px] border transition-all duration-300 text-left ${
                                    activeGroup === group.id
                                    ? 'bg-accent/10 border-accent/40 text-accent shadow-lg shadow-accent/5'
                                    : 'bg-white/[0.02] border-white/[0.05] text-text-muted hover:bg-white/[0.05] hover:border-white/[0.1]'
                                }`}
                            >
                                <group.icon size={20} />
                                <span className="text-[11px] font-black uppercase tracking-widest">{group.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Settings Content */}
                    <div className="xl:col-span-9">
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-[40px] p-8 lg:p-12 relative overflow-hidden group">
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                            
                            <div className="relative z-10 space-y-10">
                                <div className="pb-8 border-b border-white/[0.04]">
                                    <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-2">
                                        {SETTING_GROUPS.find(g => g.id === activeGroup).label} Parameters
                                    </h2>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60">
                                        Adjust core variables for the {activeGroup.toLowerCase()} subsystem.
                                    </p>
                                </div>

                                {isLoading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <RefreshCw className="animate-spin text-accent" size={32} />
                                    </div>
                                ) : groupSettings.length === 0 ? (
                                    <div className="text-center py-20 bg-white/[0.02] rounded-[32px] border border-dashed border-white/10">
                                        <AlertCircle className="mx-auto text-text-muted mb-4 opacity-20" size={48} />
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">No parameters found in this sector.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {groupSettings.map(setting => (
                                            <div key={setting.key} className="space-y-3">
                                                <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] block ml-1">
                                                    {setting.key.replace(/_/g, ' ')}
                                                </label>
                                                <div className="relative group/input">
                                                    <input
                                                        type="text"
                                                        value={formData[setting.key] || ''}
                                                        onChange={(e) => handleChange(setting.key, e.target.value)}
                                                        placeholder={`Enter ${setting.key.toLowerCase()}...`}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-white placeholder:text-white/10 focus:outline-none focus:border-accent/60 transition-all group-hover/input:border-white/20"
                                                    />
                                                </div>
                                                {setting.description && (
                                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest opacity-40 ml-1">
                                                        {setting.description}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Helpful Tip */}
                        <div className="mt-8 p-8 bg-blue-500/5 border border-blue-500/10 rounded-[32px] flex items-start gap-6">
                            <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2">Administrative Protocol</h4>
                                <p className="text-[10px] text-text-secondary font-medium leading-relaxed opacity-60 uppercase tracking-wider">
                                    Changes to system parameters take effect immediately across all nodes. 
                                    Ensure variables are double-checked before committing to the main frame.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
