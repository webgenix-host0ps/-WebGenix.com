import React, { useState } from 'react';
import { Send, Lock, Paperclip, X } from 'lucide-react';

export default function MessageInput({ onSend, showInternalToggle, isSending }) {
    const [message, setMessage] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [attachments, setAttachments] = useState([]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (attachments.length + files.length > 5) {
            alert('Maximum 5 attachments allowed.');
            return;
        }
        setAttachments(prev => [...prev, ...files]);
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim() && attachments.length === 0) return;
        
        onSend(message, isInternal, attachments);
        setMessage('');
        setIsInternal(false);
        setAttachments([]);
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

            {/* Attachments Display */}
            {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {attachments.map((file, index) => (
                        <div key={index} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2 group">
                            <Paperclip size={12} className="text-accent" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight truncate max-w-[120px]">{file.name}</span>
                            <button 
                                type="button"
                                onClick={() => removeAttachment(index)}
                                className="text-text-muted hover:text-red-400 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="flex justify-between items-center">
                <label className="bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl px-4 py-2 flex items-center gap-2 cursor-pointer transition-all">
                    <Paperclip size={14} className="text-text-muted" />
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Attach</span>
                    <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileChange}
                        multiple
                    />
                </label>
                <button 
                    type="submit" 
                    className="btn-webgenix btn-primary-webgenix py-2 px-6 flex items-center gap-2"
                    disabled={(!message.trim() && attachments.length === 0) || isSending}
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
