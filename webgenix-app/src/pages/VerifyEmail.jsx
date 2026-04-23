import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/auth.service.js';
import AuthCard from '../components/auth/AuthCard';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setStatus('error');
                setMessage('No verification token provided. Please check your email link.');
                return;
            }

            try {
                await authService.verifyEmail(token);
                setStatus('success');
                setMessage('Your email has been successfully verified! You can now log in.');
            } catch (err) {
                setStatus('error');
                const errorMsg = err.response?.data?.message || 'Failed to verify email. The link may have expired.';
                setMessage(errorMsg);
            }
        };

        verifyToken();
    }, [token]);

    // Verifying state
    if (status === 'verifying') {
        return (
            <AuthCard title="Verifying Email" subtitle="Please wait while we verify your email address...">
                <div className="flex flex-col items-center gap-6 py-8">
                    <Loader2 className="w-12 h-12 text-accent animate-spin" />
                    <p className="text-text-secondary text-sm">Verifying your email...</p>
                </div>
            </AuthCard>
        );
    }

    // Success state
    if (status === 'success') {
        return (
            <AuthCard title="Email Verified!" subtitle={message}>
                <div className="flex flex-col gap-6 text-center">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-success" />
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm">
                        Email verification successful!
                    </div>
                    <Link to="/login" className="btn-webgenix btn-primary-webgenix btn-md-webgenix">
                        Continue to Login
                    </Link>
                </div>
            </AuthCard>
        );
    }

    // Error state
    return (
        <AuthCard title="Verification Failed" subtitle="We couldn't verify your email.">
            <div className="flex flex-col gap-6 text-center">
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-error" />
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
                    {message}
                </div>
                <div className="flex flex-col gap-3">
                    <Link to="/signup" className="btn-webgenix btn-primary-webgenix btn-md-webgenix">
                        Create New Account
                    </Link>
                    <Link to="/login" className="btn-webgenix btn-secondary-webgenix btn-md-webgenix">
                        Go to Login
                    </Link>
                </div>
            </div>
        </AuthCard>
    );
}
