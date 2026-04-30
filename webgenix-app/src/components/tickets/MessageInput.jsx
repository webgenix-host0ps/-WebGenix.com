import React, { useState } from 'react';
import { Send, Lock } from 'lucide-react';

export default function MessageInput({ onSend, showInternalToggle, isSending }) {
    const [message, setMessage] = useState('');
    const [isInternal, setIsInternal] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        
        onSend(message, isInternal);
        setMessage('');
        setIsInternal(false);
    };

    return (
        <form onSubmit={handleSubmit} className="card-webgenix p-4">
            {showInternalToggle && (
                <div className="flex items-center gap-2 mb-3">
                    <button
                        type="button"
                        onClick={() => setIsInternal(!isInternal)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded transition-colors ${
                            isInternal ? 'bg-yellow-500/20 text-yellow-500' : 'text-text-muted hover:text-text-primary'
                        }`}
                    >
                        <Lock size={14} />
                        Internal Note
                    </button>
                </div>
            )}
            
            <textarea
                className={`input-webgenix min-h-[100px] mb-4 ${isInternal ? 'border-yellow-500/50 focus:border-yellow-500/50 bg-yellow-500/5' : ''}`}
                placeholder={isInternal ? "Type an internal note (visible only to staff)..." : "Type your reply..."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSending}
            />
            
            <div className="flex justify-end">
                <button 
                    type="submit" 
                    className="btn-webgenix btn-primary-webgenix py-2 px-6 flex items-center gap-2"
                    disabled={!message.trim() || isSending}
                >
                    {isSending ? (
                        <>
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send size={16} />
                            Send Reply
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
