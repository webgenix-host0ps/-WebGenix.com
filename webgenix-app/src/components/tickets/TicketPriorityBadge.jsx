import React from 'react';

export default function TicketPriorityBadge({ priority }) {
    const getPriorityTheme = (p) => {
        switch (p) {
            case 'LOW':
                return 'text-green-500';
            case 'MEDIUM':
                return 'text-blue-500';
            case 'HIGH':
                return 'text-orange-500';
            case 'URGENT':
                return 'text-red-500';
            default:
                return 'text-gray-400';
        }
    };

    return (
        <span className={`text-[10px] font-black ${getPriorityTheme(priority)} uppercase tracking-widest bg-dark-900/50 px-2 py-1 rounded-md border border-header-border shadow-sm`}>
            {priority} PRIORITY
        </span>
    );
}
