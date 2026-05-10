import React from 'react';
import { User, Shield, Clock, Paperclip, Download } from 'lucide-react';

export default function MessageThread({ messages, currentUser }) {
    if (!messages || messages.length === 0) return null;

    return (
        <div className="space-y-8">
            {messages.map((msg, idx) => {
                const isCurrentUser = msg.sender?._id === currentUser?._id;
                const isStaff = ['admin', 'support', 'lead', 'billing'].includes(msg.senderRole?.toLowerCase()) || (msg.sender?._id && !isCurrentUser && msg.sender.role !== 'client');
                const isInternal = msg.isInternal;

                return (
                    <div 
                        key={msg._id || idx} 
                        className={`flex gap-4 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                    >
                        {/* Avatar */}
                        <div className="flex-shrink-0 mt-1">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg border ${
                                isStaff 
                                    ? 'bg-gradient-to-br from-accent/20 to-blue-600/20 text-accent border-accent/20' 
                                    : isCurrentUser
                                        ? 'bg-gradient-to-br from-dark-600 to-dark-700 text-white/70 border-white/5'
                                        : 'bg-gradient-to-br from-dark-700 to-dark-800 text-text-secondary border-white/5'
                            }`}>
                                {isStaff ? <Shield size={20} /> : <User size={20} />}
                            </div>
                        </div>

                        {/* Message Content Area */}
                        <div className={`flex flex-col max-w-[80%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                            {/* Meta Info */}
                            <div className={`flex items-center gap-3 mb-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                                <span className="text-sm font-bold text-white tracking-tight">
                                    {msg.sender?.name || 'Customer'}
                                </span>
                                {isStaff && (
                                    <span className="text-[9px] uppercase font-black tracking-widest text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
                                        Support Team
                                    </span>
                                )}
                                <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-medium">
                                    <Clock size={12} className="opacity-50" />
                                    {new Date(msg.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                </div>
                            </div>

                            {/* The Bubble */}
                            <div className={`relative group p-5 rounded-2xl text-sm leading-relaxed ${
                                isInternal 
                                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.05)]' 
                                    : isCurrentUser
                                        ? 'bg-accent border border-accent-hover text-white shadow-xl shadow-accent/10 rounded-tr-none'
                                        : isStaff
                                            ? 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-white/90 rounded-tl-none hover:bg-[rgba(255,255,255,0.05)] transition-colors'
                                            : 'bg-dark-800 border border-white/5 text-text-secondary rounded-tl-none'
                            }`}>
                                {isInternal && (
                                    <div className="flex items-center gap-2 text-[10px] text-amber-400 font-black uppercase tracking-[0.2em] mb-3 border-b border-amber-500/20 pb-2">
                                        <Shield size={12} />
                                        Internal Private Note
                                    </div>
                                )}
                                
                                <div className="whitespace-pre-wrap font-medium">
                                    {msg.message}
                                </div>

                                {msg.attachments && msg.attachments.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                                        {msg.attachments.map((file, fIdx) => {
                                            const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
                                            return (
                                                <a 
                                                    key={fIdx}
                                                    href={`${baseUrl}${file.fileUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all group/file"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Paperclip size={12} className="text-accent" />
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black uppercase tracking-tight text-white/70 group-hover/file:text-white transition-colors truncate max-w-[150px]">
                                                                {file.fileName}
                                                            </span>
                                                            <span className="text-[8px] text-text-muted font-bold uppercase tracking-widest">
                                                                {(file.fileSize / 1024).toFixed(1)} KB
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Download size={14} className="text-text-muted group-hover/file:text-accent transition-all transform group-hover:scale-110" />
                                                </a>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Subtle triangle for bubbles */}
                                {!isInternal && (
                                    <div className={`absolute top-0 w-3 h-3 overflow-hidden ${isCurrentUser ? 'right-[-12px]' : 'left-[-12px]'}`}>
                                        <div className={`w-2 h-2 rotate-45 transform origin-top-left ${
                                            isCurrentUser ? 'bg-accent' : isStaff ? 'bg-[rgba(255,255,255,0.04)]' : 'bg-dark-800'
                                        }`}></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
