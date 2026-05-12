import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div className="flex items-center justify-center min-h-[400px] p-8">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto mb-6">
                            <AlertTriangle size={28} />
                        </div>
                        <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">System Error</h3>
                        <p className="text-text-secondary text-sm font-medium leading-relaxed mb-8">
                            An unexpected error occurred. Our team has been notified.
                        </p>
                        <button
                            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-accent hover:bg-accent-hover text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all"
                        >
                            <RefreshCw size={16} /> Restart Interface
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
