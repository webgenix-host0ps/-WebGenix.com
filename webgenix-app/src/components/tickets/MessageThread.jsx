import React from 'react';
import { User, Shield } from 'lucide-react';

export default function MessageThread({ messages, currentUser }) {
    if (!messages || messages.length === 0) return null;

    return (
        <div className="space-y-6">
            {messages.map((msg, idx) => {
                const isCurrentUser = msg.sender?._id === currentUser?._id;
                const isStaff = ['admin', 'support', 'lead'].includes(msg.senderRole);
                const isInternal = msg.isInternal;

                return (
                    <div 
                        key={msg._id || idx} 
                        className={`flex gap-4 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                    >
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isStaff ? 'bg-accent/10 text-accent' : 'bg-dark-700 text-text-secondary'
                            }`}>
                                {isStaff ? <Shield size={18} /> : <User size={18} />}
                            </div>
                        </div>

                        {/* Message Content */}
                        <div className={`flex flex-col max-w-[85%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-text-primary">
                                    {msg.sender?.name || 'Unknown'}
                                </span>
                                {isStaff && (
                                    <span className="text-[10px] uppercase tracking-wider text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                                        Staff
                                    </span>
                                )}
                                <span className="text-xs text-text-muted">
                                    {new Date(msg.createdAt).toLocaleString()}
                                </span>
                            </div>

                            <div className={`p-4 rounded-xl text-sm whitespace-pre-wrap ${
                                isInternal 
                                    ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-100' 
                                    : isCurrentUser
                                        ? 'bg-accent/10 border border-accent/20 text-text-primary'
                                        : 'bg-dark-800 border border-dark-700 text-text-primary'
                            }`}>
                                {isInternal && (
                                    <div className="text-xs text-yellow-500 font-medium mb-2 uppercase tracking-wider border-b border-yellow-500/20 pb-1">
                                        Internal Note
                                    </div>
                                )}
                                {msg.message}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
