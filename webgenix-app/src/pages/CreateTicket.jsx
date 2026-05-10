import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createTicket } from '../services/ticket.service';
import { ChevronRight, Send, AlertTriangle, Shield, Clock, Activity, Paperclip, X } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import api from '../services/api';

export default function CreateTicket() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);

    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        departmentId: '',
        priority: 'MEDIUM'
    });
    const [attachments, setAttachments] = useState([]);

    // Fetch departments from API
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await api.get('/tickets/departments');
                setDepartments(response.data.data || response.data);
                // Set default department after fetching
                if (response.data.data?.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        departmentId: response.data.data[0]._id
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch departments:', error);
                // Fallback to hardcoded departments if API fails
                const fallbackDepts = [
                    { _id: '662b1f1a1c4b2a1f1a1c4b2a', name: 'General Support' },
                    { _id: '662b1f1a1c4b2a1f1a1c4b2b', name: 'Billing' },
                    { _id: '662b1f1a1c4b2a1f1a1c4b2c', name: 'Technical Support' }
                ];
                setDepartments(fallbackDepts);
                setFormData(prev => ({
                    ...prev,
                    departmentId: fallbackDepts[0]._id
                }));
            } finally {
                setLoadingDepartments(false);
            }
        };
        fetchDepartments();
    }, []);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (attachments.length + files.length > 5) {
            setError('Maximum 5 attachments allowed protocol.');
            return;
        }
        setAttachments(prev => [...prev, ...files]);
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.subject.trim() || !formData.description.trim()) {
            setError('Subject and description are required components for transmission.');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            
            const data = new FormData();
            data.append('subject', formData.subject);
            data.append('description', formData.description);
            data.append('departmentId', formData.departmentId);
            data.append('priority', formData.priority);
            
            attachments.forEach(file => {
                data.append('attachments', file);
            });

            const response = await createTicket(data);
            const newTicket = response.data;
            if (newTicket?._id) {
                navigate(`/tickets/${newTicket._id}`);
            } else {
                navigate('/tickets');
            }
        } catch (err) {
            console.error('Failed to create ticket:', err);
            setError(err.response?.data?.message || 'Failed to inject signal. Re-synchronize and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl space-y-8 animate-in fade-in duration-700">
                
                {/* Header Section */}
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-4 opacity-60">
                        <Link to="/tickets" className="hover:text-white transition-colors">Support Hub</Link>
                        <ChevronRight size={12} />
                        <span className="text-accent">Signal Injection</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-4">
                        Initialize New <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40 font-black">Case Node</span>
                    </h1>
                    <p className="text-text-secondary text-sm md:text-base max-w-2xl leading-relaxed font-medium uppercase tracking-widest opacity-60">
                        Detail your technical requirements or system anomalies. Our agents will synchronize with your workspace shortly.
                    </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    
                    {/* Form Container */}
                    <div className="xl:col-span-8">
                        <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/[0.06] rounded-[40px] p-8 lg:p-12 space-y-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-accent/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                            
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                                    <AlertTriangle size={18} />
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-40">Frequency Department</label>
                                    <div className="relative group/select">
                                        <select 
                                            name="departmentId"
                                            value={formData.departmentId}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-white appearance-none focus:outline-none focus:border-accent transition-all cursor-pointer disabled:opacity-50"
                                            required
                                            disabled={loadingDepartments}
                                        >
                                            {loadingDepartments ? (
                                                <option value="">Loading departments...</option>
                                            ) : departments.length === 0 ? (
                                                <option value="">No departments available</option>
                                            ) : (
                                                departments.map(dept => (
                                                    <option key={dept._id} value={dept._id} className="bg-dark-800">{dept.name}</option>
                                                ))
                                            )}
                                        </select>
                                        <Shield size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none group-focus-within/select:text-accent transition-colors" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-40">Priority Protocol</label>
                                    <div className="relative group/select">
                                        <select 
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-white appearance-none focus:outline-none focus:border-accent transition-all cursor-pointer"
                                        >
                                            <option value="LOW" className="bg-dark-800">Alpha [Low]</option>
                                            <option value="MEDIUM" className="bg-dark-800">Beta [Medium]</option>
                                            <option value="HIGH" className="bg-dark-800">Gamma [High]</option>
                                            <option value="URGENT" className="bg-dark-800">Omega [Urgent]</option>
                                        </select>
                                        <Activity size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none group-focus-within/select:text-accent transition-colors" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-40">Signal Subject</label>
                                <input 
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-accent transition-all placeholder:text-text-muted/20"
                                    placeholder="Brief summary of the synchronization issue..."
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-40">Signal Details</label>
                                <textarea 
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-6 text-xs font-medium leading-relaxed text-white min-h-[250px] focus:outline-none focus:border-accent transition-all placeholder:text-text-muted/20 resize-none"
                                    placeholder="Provide detailed logs or steps to reproduce the anomaly..."
                                    required
                                />
                            </div>

                            {/* Attachments Area */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-40">Payload Attachments (Max 5)</label>
                                
                                <div className="flex flex-wrap gap-3">
                                    {attachments.map((file, index) => (
                                        <div key={index} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 group animate-in zoom-in duration-300">
                                            <Paperclip size={12} className="text-accent" />
                                            <span className="text-[10px] font-bold text-white uppercase tracking-tight truncate max-w-[150px]">{file.name}</span>
                                            <button 
                                                type="button"
                                                onClick={() => removeAttachment(index)}
                                                className="text-text-muted hover:text-red-400 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    
                                    {attachments.length < 5 && (
                                        <label className="bg-accent/10 border border-accent/20 hover:bg-accent/20 rounded-xl px-6 py-2 flex items-center gap-3 cursor-pointer transition-all group">
                                            <Paperclip size={14} className="text-accent group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-black text-accent uppercase tracking-widest">Attach File</span>
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                onChange={handleFileChange}
                                                multiple
                                            />
                                        </label>
                                    )}
                                </div>
                                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest opacity-40">Allowed: JPG, PNG, PDF, ZIP, TXT (Max 5MB each)</p>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-white/5">
                                <button 
                                    type="button" 
                                    onClick={() => navigate(-1)}
                                    className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-black text-text-secondary hover:text-white uppercase tracking-widest transition-all"
                                >
                                    Abort Process
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-10 py-4 bg-accent hover:bg-accent-hover text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Activity className="w-4 h-4 animate-pulse" />
                                            Injecting Signal...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            Initialize Transmission
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Meta Sidebar */}
                    <div className="xl:col-span-4 space-y-6">
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-[32px] p-8">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                <Shield size={16} className="text-accent" />
                                Security Protocol
                            </h4>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0"></div>
                                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-relaxed">Encrypted P2P transmission tunnels are active.</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0"></div>
                                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-relaxed">Priority status Gamma & Omega bypass standard queues.</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0"></div>
                                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-relaxed">Logs are auto-purged every 365 solar cycles.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-accent/5 border border-accent/10 rounded-[32px] p-8">
                            <Clock size={24} className="text-accent mb-4" />
                            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-2">Sync Estimate</h4>
                            <p className="text-accent/60 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                Average response time for current network load: <span className="text-white">12-18 Minutes</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="h-10" />
            </div>
        </DashboardLayout>
    );
}
