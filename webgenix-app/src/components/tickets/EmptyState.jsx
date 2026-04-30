import React from 'react';

export default function EmptyState({ title, message, actionLabel, onAction, icon: Icon }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center card-webgenix">
            {Icon && (
                <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center mb-4 text-text-muted">
                    <Icon size={32} />
                </div>
            )}
            <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
            <p className="text-text-secondary max-w-md mb-6">{message}</p>
            {actionLabel && onAction && (
                <button onClick={onAction} className="btn-webgenix btn-primary-webgenix py-2 px-6">
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
