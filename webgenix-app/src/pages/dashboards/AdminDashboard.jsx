import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, TicketIcon, Settings, Activity, Zap, TrendingUp, AlertCircle, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate data loading
        setTimeout(() => setLoading(false), 800);
    }, []);

    const adminStats = [
        { label: 'Total Operators', value: '1,284', icon: Users, color: 'blue', trend: '+14%' },
        { label: 'System Signals', value: '42', icon: TicketIcon, color: 'amber', trend: 'Priority' },
        { label: 'Network Load', value: '24%', icon: Activity, color: 'green', trend: 'Stable' },
        { label: 'Energy Flux', value: '1.2kW', icon: Zap, color: 'purple', trend: 'Optimal' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-[32px] animate-in fade-in duration-700">
                
                {/* Admin Hero */}
                <div className="relative p-10 lg:p-14 rounded-[40px] bg-gradient-to-br from-red-500/10 via-dark-800 to-transparent border border-white/[0.06] overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400">Master Authority Override Active</span>
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tighter mb-6 leading-tight">
                            System Terminal <br/>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">Root Level Access</span>
                        </h1>
                        <p className="text-text-secondary text-sm md:text-lg max-w-2xl leading-relaxed font-bold uppercase tracking-widest opacity-60">
                            Welcome, Administrator {user?.name?.split(' ')[0]}. Global infrastructure monitoring and user permission matrices are now online.
                        </p>
                    </div>
                </div>

                {/* System Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {adminStats.map((stat, i) => (
                        <div key={i} className="bg-white/[0.03] border border-white/[0.06] p-8 rounded-[32px] group hover:border-red-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/5">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center text-${stat.color}-400 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-${stat.color}-500/10`}>
                                    <stat.icon size={22} />
                                </div>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg bg-${stat.color}-500/10 text-${stat.color}-400 border border-${stat.color}-500/20 uppercase tracking-widest`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <h3 className="text-4xl font-black text-white mb-1 tracking-tight">{stat.value}</h3>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-50">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Activity Log */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <TrendingUp size={20} className="text-red-400" />
                                <h2 className="text-xl font-black text-white tracking-tight uppercase">System Flux</h2>
                            </div>
                            <button className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:underline">Full Log Access</button>
                        </div>

                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-[40px] overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/[0.03] border-b border-white/[0.04]">
                                        <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Timestamp</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Operator</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Action</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                                            <td className="px-8 py-6 text-xs font-mono text-text-muted">2024.05.01 14:3{i}:22</td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-7 h-7 rounded-lg bg-dark-700 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white uppercase">US</div>
                                                    <span className="text-sm font-black text-white">Operator_{i}284</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-text-secondary font-bold uppercase tracking-widest text-[10px]">Permission_Matrix_Update</td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-black uppercase">Verified</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* System Alerts */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <AlertCircle size={20} className="text-amber-400" />
                                <h2 className="text-xl font-black text-white tracking-tight uppercase">Signals</h2>
                            </div>
                            <button className="text-[10px] font-black text-amber-400 uppercase tracking-widest hover:underline">Mute All</button>
                        </div>

                        <div className="bg-dark-900 border border-header-border rounded-[32px] p-2 overflow-hidden shadow-2xl">
                            {[
                                { title: 'DDoS Mitigation Triggered', time: '2m ago', type: 'Critical' },
                                { title: 'New Operator Authenticated', time: '14m ago', type: 'System' },
                                { title: 'Kernel Optimization Required', time: '1h ago', type: 'Warning' },
                                { title: 'Backup Protocol Complete', time: '3h ago', type: 'System' },
                            ].map((alert, i) => (
                                <div key={i} className="p-5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-all cursor-pointer group">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${alert.type === 'Critical' ? 'text-red-400' : alert.type === 'Warning' ? 'text-amber-400' : 'text-blue-400'}`}>{alert.type}</span>
                                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-40">{alert.time}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">{alert.title}</h4>
                                </div>
                            ))}
                        </div>

                        {/* Quick Command Hub */}
                        <div className="p-8 rounded-[32px] bg-gradient-to-br from-red-600 to-red-800 overflow-hidden shadow-2xl shadow-red-500/20 group relative">
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                            <Shield className="text-white/40 mb-4" size={28} />
                            <h4 className="text-white font-black text-lg mb-2 uppercase tracking-tight">Security Matrix</h4>
                            <p className="text-white/70 text-xs font-bold leading-relaxed mb-6 italic opacity-80">Execute global security refresh and rotate encryption kernels.</p>
                            <button className="w-full py-4 rounded-2xl bg-white text-red-700 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-100 transition-all shadow-xl">
                                Re-Encrypt All Nodes
                            </button>
                        </div>
                    </div>
                </div>

                <div className="h-10" />
            </div>
        </DashboardLayout>
    );
}
