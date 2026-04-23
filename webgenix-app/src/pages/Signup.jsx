import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import AuthCard from '../components/auth/AuthCard';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
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
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      setIsSuccess(true);
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';
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

  // Success state after registration
  if (isSuccess) {
    return (
      <AuthCard title="Registration Successful!" subtitle="Please check your email to verify your account.">
        <div className="flex flex-col gap-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm">
            We've sent a verification link to <strong>{formData.email}</strong>. Please check your inbox and click the link to activate your account.
          </div>
          <Link to="/login" className="btn-webgenix btn-primary-webgenix btn-md-webgenix">
            Go to Login
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create Account" subtitle="Join Webgenix and scale your AI capabilities">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errors.form && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs text-center">
            {errors.form}
          </div>
        )}

        <AuthInput
          label="Full Name"
          id="name"
          placeholder="John Doe"
          icon={User}
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <AuthInput
          label="Email Address"
          id="email"
          type="email"
          placeholder="name@company.com"
          icon={Mail}
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <div className="relative">
          <AuthInput
            label="Password"
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            icon={Lock}
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />
          <button
            type="button"
            className="absolute right-3.5 top-[38px] text-text-muted hover:text-text-secondary transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <AuthInput
          label="Confirm Password"
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          icon={ShieldCheck}
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
        />

        <div className="flex items-start gap-3 py-2 group">
          <input type="checkbox" id="terms" required className="checkbox-webgenix mt-0.5" />
          <label htmlFor="terms" className="text-[13px] text-text-secondary leading-relaxed cursor-pointer group-hover:text-text-primary transition-colors">
            I agree to the{' '}
            <Link to="/terms" className="text-accent hover:text-accent-light font-medium">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-accent hover:text-accent-light font-medium">Privacy Policy</Link>
          </label>
        </div>

        <div className="mt-2">
          <AuthButton loading={isLoading}>Create Account</AuthButton>
        </div>

        <p className="text-center text-[14px] text-text-secondary mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accent-light font-semibold transition-colors">
            Sign In
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
