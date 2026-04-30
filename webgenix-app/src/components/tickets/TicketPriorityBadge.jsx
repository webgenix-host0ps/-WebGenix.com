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
        <span className={`text-xs font-medium ${getPriorityTheme(priority)} uppercase tracking-wider`}>
            {priority} Priority
        </span>
    );
}
