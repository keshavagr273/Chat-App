import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiMail, FiLock, FiMessageCircle } from 'react-icons/fi';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate('/chat');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden font-sans px-4">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Card */}
      <div className="w-full max-w-[420px] bg-[#0c0c0c]/95 backdrop-blur-sm border border-[#222] rounded-[24px] shadow-2xl p-9 relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-[52px] h-[52px] bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center shadow-lg shadow-primary/10">
            <FiMessageCircle className="text-primary text-2xl stroke-[2]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-[32px] font-medium text-gray-100 text-center mb-1.5 tracking-wide">
          Welcome Back!
        </h2>
        <p className="text-[#8e98a8] text-center mb-8 text-[16px]">
          Sign in to continue chatting
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-[#8e98a8] mb-1.5 text-[15px] font-medium ml-1">
              Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <FiMail className="text-[#596377] text-[22px] group-focus-within:text-gray-300 transition-colors" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-[#111] border border-[#222] rounded-xl text-gray-200 placeholder-[#495466] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-[20px] placeholder:text-[20px] caret-white"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[#8e98a8] mb-1.5 text-[15px] font-medium ml-1">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <FiLock className="text-[#596377] text-[22px] group-focus-within:text-gray-300 transition-colors" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-[#111] border border-[#222] rounded-xl text-gray-200 placeholder-[#495466] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-[20px] placeholder:text-[20px] caret-white tracking-[0.2em]"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-secondary text-black font-medium py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4 text-[17px]"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Register Link */}
        <p className="mt-7 text-center text-[#8e98a8] text-[15px]">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:text-secondary transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
