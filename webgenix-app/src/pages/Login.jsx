import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import AuthCard from '../components/auth/AuthCard';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      await login({ email: formData.email, password: formData.password });
      navigate(from, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid credentials. Please try again.';
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

  return (
    <AuthCard title="Welcome Back" subtitle="Sign in to manage your AI infrastructure">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {errors.form && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs text-center">
            {errors.form}
          </div>
        )}
        
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

        <AuthInput
          label="Password"
          id="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          icon={Lock}
          rightIcon={showPassword ? EyeOff : Eye}
          onRightIconClick={() => setShowPassword(!showPassword)}
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
        />

        <div className="flex items-center justify-between py-1">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input type="checkbox" className="checkbox-webgenix" />
            <span className="text-[13px] text-text-secondary group-hover:text-text-primary transition-colors">Remember me</span>
          </label>
          <Link to="/forgot-password" size="sm" className="text-[13px] font-medium text-accent hover:text-accent-light transition-colors">
            Forgot password?
          </Link>
        </div>

        <div className="mt-2">
          <AuthButton loading={isLoading}>Sign In</AuthButton>
        </div>

        <p className="text-center text-[14px] text-text-secondary mt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="text-accent hover:text-accent-light font-semibold transition-colors">
            Create an account
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
