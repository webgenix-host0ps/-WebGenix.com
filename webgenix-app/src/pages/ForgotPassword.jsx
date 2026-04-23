import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { authService } from '../services/auth.service.js';
import AuthCard from '../components/auth/AuthCard';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthCard title="Check your email" subtitle={`We've sent a password reset link to ${email}`}>
        <div className="flex flex-col gap-6">
          <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm text-center">
            If an account exists for this email, you will receive reset instructions shortly.
          </div>
          <Link to="/login" className="btn-webgenix btn-primary-webgenix btn-md-webgenix w-full">
            Back to Sign In
          </Link>
          <button 
            onClick={() => setIsSubmitted(false)} 
            className="text-xs text-text-secondary hover:text-text-primary transition-colors mx-auto"
          >
            Didn't receive the email? Try again
          </button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset Password" subtitle="Enter your email to receive a reset link">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <AuthInput
          label="Email Address"
          id="email"
          type="email"
          placeholder="name@company.com"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          required
        />

        <AuthButton loading={isLoading}>Send Reset Link</AuthButton>

        <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft size={16} />
          <span>Back to Sign In</span>
        </Link>
      </form>
    </AuthCard>
  );
}
