import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, ArrowLeft, CheckCircle } from 'lucide-react';
import { authService } from '../services/auth.service.js';
import AuthCard from '../components/auth/AuthCard';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Validate token exists
    if (!token) {
        return (
            <AuthCard title="Invalid Link" subtitle="This password reset link is invalid or has expired.">
                <div className="flex flex-col gap-6 text-center">
                    <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
                        The reset link appears to be broken. Please request a new password reset.
                    </div>
                    <Link to="/forgot-password" className="btn-webgenix btn-primary-webgenix btn-md-webgenix">
                        Request New Link
                    </Link>
                </div>
            </AuthCard>
        );
    }

    const validate = () => {
        const newErrors = {};
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setIsLoading(true);

        try {
            await authService.resetPassword(token, formData.password);
            setIsSuccess(true);
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to reset password. Please try again.';
            setErrors({ form: message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
        if (errors[id]) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
        }
    };

    if (isSuccess) {
        return (
            <AuthCard title="Password Reset Successful" subtitle="Your password has been updated.">
                <div className="flex flex-col gap-6 text-center">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-success" />
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm">
                        Your password has been successfully reset. You can now log in with your new password.
                    </div>
                    <Link to="/login" className="btn-webgenix btn-primary-webgenix btn-md-webgenix">
                        Go to Login
                    </Link>
                </div>
            </AuthCard>
        );
    }

    return (
        <AuthCard title="Create New Password" subtitle="Enter your new password below">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {errors.form && (
                    <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs text-center">
                        {errors.form}
                    </div>
                )}

                <div className="relative">
                    <AuthInput
                        label="New Password"
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        required
                    />
                </div>

                <AuthInput
                    label="Confirm New Password"
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    icon={ShieldCheck}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    required
                />

                <div className="mt-2">
                    <AuthButton loading={isLoading}>Reset Password</AuthButton>
                </div>

                <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
                    <ArrowLeft size={16} />
                    <span>Back to Sign In</span>
                </Link>
            </form>
        </AuthCard>
    );
}
