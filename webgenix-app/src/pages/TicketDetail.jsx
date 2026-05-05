import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    Calendar, User, Shield, MessageSquare,
    Clock, FileText, Send, MoreHorizontal, ChevronRight, Activity, Zap
} from 'lucide-react';
import { getTicket, replyToTicket, changeTicketStatus, closeTicket } from '../services/ticket.service';
import { useAuth } from '../context/AuthContext.jsx';
import TicketStatusBadge from '../components/tickets/TicketStatusBadge.jsx';
import TicketPriorityBadge from '../components/tickets/TicketPriorityBadge.jsx';
import MessageThread from '../components/tickets/MessageThread.jsx';
import MessageInput from '../components/tickets/MessageInput.jsx';
import DashboardLayout from '../components/dashboard/DashboardLayout';

export default function TicketDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [ticketData, setTicketData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    
    const messagesEndRef = useRef(null);
    const isStaff = user && ['admin', 'support', 'lead'].includes(user.role);

    const fetchTicketData = async () => {
        try {
            setIsLoading(true);
            setError('');
            const response = await getTicket(id);
            setTicketData(response.data.data);
        } catch (err) {
            console.error('Failed to fetch ticket:', err);
            setError(err.response?.data?.message || 'Failed to load ticket details.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTicketData();
    }, [id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ticketData?.messages]);

    const handleReply = async (message, isInternal) => {
        try {
            setIsSending(true);
            await replyToTicket(id, { message, isInternal });
            await fetchTicketData();
        } catch (err) {
            console.error('Failed to send reply:', err);
            setError('Failed to send reply. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    const handleCloseTicket = async () => {
        if (!window.confirm('Are you sure you want to close this ticket?')) return;
        try {
            await closeTicket(id);
            await fetchTicketData();
        } catch (err) {
            console.error('Failed to close ticket:', err);
            setError('Failed to close ticket.');
        }
    };

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        if (!newStatus) return;
        try {
            await changeTicketStatus(id, newStatus);
            await fetchTicketData();
        } catch (err) {
            console.error('Failed to change status:', err);
            setError('Failed to change status.');
        }
    };

    if (isLoading && !ticketData) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Activity className="w-10 h-10 text-accent animate-pulse" />
                </div>
            </DashboardLayout>
        );
    }

    if (error && !ticketData) {
        return (
            <DashboardLayout>
                <div className="max-w-xl mx-auto bg-red-500/10 border border-red-500/20 p-10 rounded-[32px] text-center mt-20">
                    <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Signal Interrupted</h3>
                    <p className="text-red-200/60 mb-8 font-bold uppercase tracking-widest text-[10px]">{error}</p>
                    <button onClick={() => navigate('/tickets')} className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                        Return to Hub
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const { ticket, messages } = ticketData;

    return (
        <DashboardLayout>
            <div className="space-y-[32px] animate-in fade-in duration-700">
                
                {/* Header / Breadcrumbs */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-text-muted mb-4 opacity-60">
                            <Link to="/tickets" className="hover:text-white transition-colors">Support Hub</Link>
                            <ChevronRight size={12} />
                            <span className="text-accent">Case #{ticket.ticketId}</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-4">
                            {ticket.subject}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 opacity-80">
                            <TicketStatusBadge status={ticket.status} />
                            <TicketPriorityBadge priority={ticket.priority} />
                            <div className="h-4 w-px bg-white/10 mx-2" />
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={14} className="text-accent" />
                                Synchronized {new Date(ticket.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {!ticket.isClosed && !isStaff && (
                        <button 
                            onClick={handleCloseTicket}
                            className="px-8 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3"
                        >
                            <Zap size={16} /> Sever Connection
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    
                    {/* Conversation Area */}
                    <div className="xl:col-span-8 space-y-8">
                        {/* Initial Description */}
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-[32px] p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-4">Initial Log Report</p>
                                <div className="text-text-secondary text-sm md:text-base leading-relaxed font-medium italic opacity-80 whitespace-pre-wrap">
                                    "{ticket.description}"
                                </div>
                            </div>
                        </div>

                        {/* Thread */}
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-[40px] p-8 lg:p-12 min-h-[400px]">
                            <div className="flex items-center justify-between mb-12 pb-6 border-b border-white/[0.04]">
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                                    <MessageSquare size={18} className="text-accent" />
                                    Transmission Stream
                                </h3>
                                <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] bg-white/5 px-3 py-1 rounded-full">
                                    {messages?.length || 0} Signals
                                </span>
                            </div>
                            
                            <MessageThread messages={messages} currentUser={user} />
                            <div ref={messagesEndRef} className="h-4" />
                        </div>

                        {/* Input */}
                        {!ticket.isClosed ? (
                            <div className="bg-white/[0.03] border border-white/[0.06] rounded-[40px] p-8 shadow-2xl relative group focus-within:border-accent/40 transition-all">
                                <div className="flex items-center gap-3 mb-6 font-black text-white uppercase tracking-[0.3em] text-[10px]">
                                    <Send size={16} className="text-accent" />
                                    Inject Response
                                </div>
                                <MessageInput 
                                    onSend={handleReply} 
                                    showInternalToggle={isStaff} 
                                    isSending={isSending}
                                />
                            </div>
                        ) : (
                            <div className="bg-white/[0.02] border border-white/[0.06] border-dashed rounded-[40px] p-12 text-center opacity-60">
                                <Activity className="w-12 h-12 text-text-muted mx-auto mb-4" />
                                <h4 className="text-white font-black uppercase tracking-widest mb-2">Protocol Terminated</h4>
                                <p className="text-text-secondary text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                    This synchronization node was archived on {new Date(ticket.closedAt).toLocaleString()}.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="xl:col-span-4 space-y-6 lg:sticky lg:top-[120px]">
                        
                        {/* Meta Card */}
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-[32px] overflow-hidden group">
                            <div className="bg-white/5 p-6 border-b border-white/5 flex items-center gap-3 font-black text-white text-[10px] uppercase tracking-[0.3em]">
                                <FileText size={18} className="text-accent" />
                                Node Metadata
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="flex items-center justify-between group/meta">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-40 group-hover/meta:opacity-100 transition-opacity flex items-center gap-2"><User size={14} /> Subject</span>
                                    <span className="text-xs font-black text-white uppercase tracking-widest">{ticket.client?.name || 'Customer'}</span>
                                </div>
                                <div className="flex items-center justify-between group/meta">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-40 group-hover/meta:opacity-100 transition-opacity flex items-center gap-2"><Shield size={14} /> Domain</span>
                                    <span className="text-xs font-black text-white uppercase tracking-widest">{ticket.department?.name || 'Support'}</span>
                                </div>
                                <div className="flex items-center justify-between group/meta">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-40 group-hover/meta:opacity-100 transition-opacity flex items-center gap-2"><Clock size={14} /> Pulse</span>
                                    <span className="text-xs font-black text-accent uppercase tracking-widest animate-pulse">Active</span>
                                </div>
                            </div>
                        </div>

                        {/* Management Card */}
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-[32px] overflow-hidden group">
                            <div className="bg-white/5 p-6 border-b border-white/5 flex items-center gap-3 font-black text-white text-[10px] uppercase tracking-[0.3em]">
                                <Activity size={18} className="text-accent" />
                                Administrative Overrides
                            </div>
                            <div className="p-8 space-y-4">
                                {isStaff ? (
                                    <div className="space-y-4">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-40">System Status Adjustment</p>
                                        <div className="relative">
                                            <select 
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-[10px] font-black uppercase tracking-widest text-white appearance-none focus:outline-none focus:border-accent transition-all cursor-pointer"
                                                value={ticket.status}
                                                onChange={handleStatusChange}
                                            >
                                                <option value="OPEN" className="bg-dark-800">Status: Open</option>
                                                <option value="ANSWERED" className="bg-dark-800">Status: Answered</option>
                                                <option value="CLIENT_REPLY" className="bg-dark-800">Status: Reply</option>
                                                <option value="IN_PROGRESS" className="bg-dark-800">Status: Progress</option>
                                                <option value="RESOLVED" className="bg-dark-800">Status: Resolved</option>
                                                <option value="CLOSED" className="bg-dark-800">Status: Closed</option>
                                            </select>
                                            <Activity size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                                        </div>
                                    </div>
                                ) : (
                                    !ticket.isClosed && (
                                        <button 
                                            onClick={handleCloseTicket}
                                            className="w-full py-4 bg-accent/10 hover:bg-accent border border-accent/20 text-accent hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-accent/5 flex items-center justify-center gap-2"
                                        >
                                            Terminate Ticket
                                        </button>
                                    )
                                )}
                                <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-black text-text-secondary hover:text-white uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-3">
                                    <FileText size={16} /> Export Transcript
                                </button>
                                <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-black text-text-secondary hover:text-white uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-3">
                                    <MoreHorizontal size={16} /> Advanced Metrics
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="h-10" />
            </div>
        </DashboardLayout>
    );
}
