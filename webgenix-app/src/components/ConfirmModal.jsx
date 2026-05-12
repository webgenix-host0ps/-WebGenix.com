import { useEffect } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'danger', loading = false }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const variantStyles = {
        danger: 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20',
        warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20',
        accent: 'bg-accent border-accent text-white hover:bg-accent-hover',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative bg-dark-900 border border-white/10 w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                <button onClick={onClose} className="absolute top-6 right-6 text-text-muted hover:text-white transition-colors">
                    <X size={18} />
                </button>

                <div className="text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
                        <AlertTriangle size={28} />
                    </div>

                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">{title || 'Confirm Action'}</h3>
                        <p className="text-text-secondary text-sm font-medium leading-relaxed">{message || 'Are you sure you want to proceed?'}</p>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all disabled:opacity-50 ${variantStyles[variant] || variantStyles.danger}`}
                        >
                            {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
