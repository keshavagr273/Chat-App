import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiMail, FiLock, FiUser, FiMessageCircle } from 'react-icons/fi';
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d0f14] relative overflow-hidden font-sans px-4">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#663399]/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Card */}
      <div className="w-full max-w-[420px] bg-[#1a1c22]/95 backdrop-blur-sm border border-[#272a34] rounded-[24px] shadow-2xl p-9 relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-[52px] h-[52px] bg-[#e5e7eb] rounded-full flex items-center justify-center shadow-lg">
            <FiMessageCircle className="text-[#1a1c22] text-2xl stroke-[2] translate-y-[-1px] fill-[#1a1c22]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-[36px] font-semibold text-gray-100 text-center mb-2 tracking-wide">
          Create Account
        </h2>
        <p className="text-[#8e98a8] text-center mb-10 text-[18px]">
          Join us and start chatting
        </p>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-[#8e98a8] mb-1.5 text-[15px] font-medium ml-1">
              Username
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <FiUser className="text-[#596377] text-[22px] group-focus-within:text-gray-300 transition-colors" />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-[#12141a] border border-[#272a34] rounded-xl text-gray-200 placeholder-[#495466] focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-all text-[20px] placeholder:text-[20px] caret-white"
                placeholder="johndoe"
                required
                minLength={3}
              />
            </div>
          </div>

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
                className="w-full pl-12 pr-4 py-4 bg-[#12141a] border border-[#272a34] rounded-xl text-gray-200 placeholder-[#495466] focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-all text-[20px] placeholder:text-[20px] caret-white"
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
                className="w-full pl-12 pr-4 py-4 bg-[#12141a] border border-[#272a34] rounded-xl text-gray-200 placeholder-[#495466] focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-all text-[20px] placeholder:text-[20px] caret-white tracking-[0.2em]"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[#8e98a8] mb-1.5 text-[15px] font-medium ml-1">
              Confirm Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <FiLock className="text-[#596377] text-[22px] group-focus-within:text-gray-300 transition-colors" />
              </div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-[#12141a] border border-[#272a34] rounded-xl text-gray-200 placeholder-[#495466] focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-all text-[20px] placeholder:text-[20px] caret-white tracking-[0.2em]"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4a148c] hover:bg-[#5a189a] text-gray-100 font-semibold py-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-8 shadow-lg shadow-[#4a148c]/20 active:scale-[0.98] text-[19px]"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-8 text-center text-[#8e98a8] text-[16px]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#9d81d2] hover:text-[#c4b5fd] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
