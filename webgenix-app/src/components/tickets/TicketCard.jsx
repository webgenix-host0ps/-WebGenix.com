import React from 'react';
import TicketStatusBadge from './TicketStatusBadge.jsx';
import TicketPriorityBadge from './TicketPriorityBadge.jsx';
import { Clock } from 'lucide-react';

export default function TicketCard({ ticket, onClick }) {
    return (
        <div 
            className="card-webgenix card-webgenix-hover p-5 cursor-pointer flex flex-col gap-4"
            onClick={onClick}
        >
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                    <span className="text-text-muted text-xs font-mono">{ticket.ticketId}</span>
                    <h3 className="text-text-primary font-medium text-lg leading-tight line-clamp-1">{ticket.subject}</h3>
                </div>
                <TicketStatusBadge status={ticket.status} />
            </div>
            
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-dark-700">
                <div className="flex items-center gap-4">
                    <TicketPriorityBadge priority={ticket.priority} />
                    <span className="text-xs text-text-muted hidden sm:inline-block">•</span>
                    <span className="text-xs text-text-muted hidden sm:inline-block">
                        {ticket.department?.name || 'Support'}
                    </span>
                </div>
                
                <div className="flex items-center gap-1.5 text-text-muted text-xs">
                    <Clock size={14} />
                    <span>
                        {ticket.lastReplyAt ? new Date(ticket.lastReplyAt).toLocaleDateString() : new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    );
}
