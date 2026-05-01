import React from 'react';
import TicketStatusBadge from './TicketStatusBadge.jsx';
import TicketPriorityBadge from './TicketPriorityBadge.jsx';
import { Clock, MessageSquare, ArrowRight, Folder } from 'lucide-react';

export default function TicketCard({ ticket, onClick }) {
    return (
        <div 
            className="group relative flex flex-col bg-[rgba(17,20,28,0.88)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] rounded-2xl p-[22px] transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-1 hover:border-accent/30 cursor-pointer overflow-hidden"
            onClick={onClick}
        >
            {/* Top Row */}
            <div className="flex justify-between items-start mb-4">
                <span className="text-text-muted text-xs font-mono font-medium px-2 py-1 bg-dark-800 rounded-md border border-dark-700">
                    {ticket.ticketId || ticket._id?.substring(0,8).toUpperCase()}
                </span>
                <TicketStatusBadge status={ticket.status} />
            </div>
            
            {/* Middle Row */}
            <div className="flex-1 mb-6">
                <h3 className="text-text-primary font-semibold text-[17px] leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                    {ticket.subject}
                </h3>
            </div>
            
            {/* Bottom Metadata */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 text-xs text-text-secondary">
                <div className="flex items-center gap-1.5">
                    <TicketPriorityBadge priority={ticket.priority} />
                </div>
                <div className="flex items-center gap-1.5 bg-dark-800/50 px-2 py-1 rounded-md">
                    <Folder size={14} className="text-text-muted" />
                    <span>{ticket.department?.name || ticket.department || 'Support'}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-dark-800/50 px-2 py-1 rounded-md">
                    <Clock size={14} className="text-text-muted" />
                    <span>
                        {ticket.lastReplyAt ? new Date(ticket.lastReplyAt).toLocaleDateString() : new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-[rgba(255,255,255,0.04)] flex items-center justify-between">
                <button className="flex items-center gap-2 text-sm font-medium text-text-secondary group-hover:text-white transition-colors">
                    <MessageSquare size={16} />
                    <span>Reply Ticket</span>
                </button>
                <button className="flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover transition-colors">
                    <span>View Details</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Subtle Gradient Hint */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
    );
}
