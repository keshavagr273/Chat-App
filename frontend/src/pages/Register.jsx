import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      navigate('/chat');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden font-sans px-4 py-8">
      {/* Background Aurora Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] emerald-glow-bg rounded-full blur-3xl pointer-events-none opacity-60"></div>
      
      {/* Subtle radial ambient gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-container-highest/40 via-background to-background pointer-events-none"></div>

      {/* Main Glass Bento Card */}
      <div className="w-full max-w-[440px] bento-card relative z-10 p-8 sm:p-10 border border-border-glass shadow-2xl">
        {/* Logo & Badge */}
        <div className="flex justify-center mb-5">
          <Link to="/" title="Back to Home" className="w-14 h-14 rounded-2xl bg-primary-container/20 border border-primary/40 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.25)] relative group transition-transform duration-300 hover:scale-105">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              person_add
            </span>
          </Link>
        </div>

        {/* Title & Subtitle */}
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface text-center mb-2 tracking-tight">
          Create Your Account
        </h2>
        <p className="text-text-muted text-center mb-7 text-sm">
          Join ChatSphere to connect with high-speed messaging
        </p>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-label uppercase tracking-wider text-text-muted mb-2 font-medium">
              Username
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                <FiUser className="text-lg" />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest/80 border border-border-glass rounded-xl text-on-surface placeholder-text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all text-sm font-sans"
                placeholder="johndoe"
                required
                minLength={3}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-label uppercase tracking-wider text-text-muted mb-2 font-medium">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                <FiMail className="text-lg" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest/80 border border-border-glass rounded-xl text-on-surface placeholder-text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all text-sm font-sans"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-label uppercase tracking-wider text-text-muted mb-2 font-medium">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                <FiLock className="text-lg" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest/80 border border-border-glass rounded-xl text-on-surface placeholder-text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all text-sm font-sans"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-label uppercase tracking-wider text-text-muted mb-2 font-medium">
              Confirm Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                <FiLock className="text-lg" />
              </div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest/80 border border-border-glass rounded-xl text-on-surface placeholder-text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all text-sm font-sans"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 primary-gradient-btn text-on-primary font-display font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-glow text-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              <span>Get Started</span>
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-7 text-center text-text-muted text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-secondary-light font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
