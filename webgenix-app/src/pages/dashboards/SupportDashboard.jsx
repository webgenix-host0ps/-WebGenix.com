import { Link, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, TicketIcon, MessageSquare, Clock, CheckCircle, Search, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

export default function SupportDashboard() {
    const { user } = useAuth();

    const supportMetrics = [
        { label: 'Active Tickets', value: '18', icon: MessageSquare, color: 'blue' },
        { label: 'Avg. Response', value: '14m', icon: Clock, color: 'amber' },
        { label: 'Resolved Today', value: '32', icon: CheckCircle, color: 'green' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-[32px] animate-in fade-in duration-700">
                
                {/* Support Hero */}
                <div className="relative p-10 lg:p-14 rounded-[40px] bg-white/[0.03] border border-white/[0.06] overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 blur-[100px] rounded-full translate-x-1/4 -translate-y-1/4"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Support Node Active</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-6 leading-tight">
                            Resolution Terminal <br/>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">Agent Workspace</span>
                        </h1>
                        <p className="text-text-secondary text-sm md:text-base max-w-2xl leading-relaxed font-bold uppercase tracking-widest opacity-60">
                            Welcome back, {user?.name?.split(' ')[0]}. You have 8 tickets requiring immediate intervention in your primary queue.
                        </p>
                        
                        <div className="mt-10 flex flex-wrap gap-4">
                            <Link to="/tickets" className="px-8 py-4 bg-accent hover:bg-accent-hover text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-accent/20 hover:shadow-accent/40 flex items-center gap-3">
                                <TicketIcon size={16} /> Open Ticket Queue
                            </Link>
                            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center gap-3">
                                <Search size={16} /> Locate Case
                            </button>
                        </div>
                    </div>
                </div>

                {/* Agent Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {supportMetrics.map((stat, i) => (
                        <div key={i} className="bg-white/[0.02] border border-white/[0.06] p-8 rounded-[32px] group hover:border-accent/30 transition-all duration-500">
                            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center text-${stat.color}-400 mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                <stat.icon size={22} />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-1 tracking-tight">{stat.value}</h3>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-50">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Priority Queue Snippet */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-black text-white tracking-tight uppercase">Priority Intervention Queue</h2>
                            <button className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline flex items-center gap-2">
                                <Filter size={12} /> Filter Signals
                            </button>
                        </div>

                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-[40px] p-2 overflow-hidden shadow-2xl">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-6 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-all cursor-pointer group flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-dark-700 border border-white/10 flex items-center justify-center text-[10px] font-black text-white">#92{i}4</div>
                                        <div>
                                            <h4 className="text-sm font-black text-white group-hover:text-accent transition-colors mb-1">Server Latency In Region_US_West_{i}</h4>
                                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-60">Reported by High_Value_Client_{i} • 12m ago</p>
                                        </div>
                                    </div>
                                    <div className="hidden sm:block">
                                        <span className="px-3 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-black uppercase tracking-widest">Urgent</span>
                                    </div>
                                </div>
                            ))}
                            <Link to="/tickets" className="block p-5 text-center text-[10px] font-black text-text-muted uppercase tracking-[0.3em] hover:text-white transition-colors">
                                View Full Synchronization Log
                            </Link>
                        </div>
                    </div>

                    {/* Agent Tools */}
                    <div className="lg:col-span-4 space-y-6">
                        <h2 className="text-xl font-black text-white tracking-tight uppercase px-2">Quick Macros</h2>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { label: 'Server Reboot Protocol', icon: Shield },
                                { label: 'License Verification', icon: CheckCircle },
                                { label: 'Billing Adjustment', icon: Clock },
                            ].map((tool, i) => (
                                <button key={i} className="flex items-center gap-4 p-5 rounded-[24px] bg-white/[0.03] border border-white/5 hover:border-accent/40 hover:bg-white/[0.05] transition-all group text-left">
                                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                        <tool.icon size={18} />
                                    </div>
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{tool.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="p-8 rounded-[32px] bg-gradient-to-br from-blue-600 to-blue-800 overflow-hidden shadow-2xl shadow-blue-500/20 group relative mt-4">
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                            <h4 className="text-white font-black text-lg mb-2 uppercase tracking-tight">Need Assistance?</h4>
                            <p className="text-white/70 text-[10px] font-bold leading-relaxed mb-6 uppercase tracking-widest italic opacity-80">Connect to the Senior Lead Terminal for complex architectural overrides.</p>
                            <button className="w-full py-4 rounded-2xl bg-white text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-100 transition-all shadow-xl">
                                Request Escalation
                            </button>
                        </div>
                    </div>
                </div>

                <div className="h-10" />
            </div>
        </DashboardLayout>
    );
}
