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
    <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden font-sans px-4">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Card */}
      <div className="w-full max-w-[420px] bg-[#0c0c0c]/95 backdrop-blur-sm border border-[#222] rounded-[24px] shadow-2xl p-7 relative z-10 my-4">
        {/* Logo */}
        <div className="flex justify-center mb-5">
          <div className="w-[48px] h-[48px] bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center shadow-lg shadow-primary/10">
            <FiMessageCircle className="text-primary text-xl stroke-[2] translate-y-[-1px]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-[30px] font-semibold text-gray-100 text-center mb-1 tracking-wide">
          Create Account
        </h2>
        <p className="text-[#8e98a8] text-center mb-6 text-[15px]">
          Join us and start chatting
        </p>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Username */}
          <div>
            <label className="block text-[#8e98a8] mb-1 text-[13px] font-medium ml-1">
              Username
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <FiUser className="text-[#596377] text-[18px] group-focus-within:text-gray-300 transition-colors" />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-[#111] border border-[#222] rounded-xl text-gray-200 placeholder-[#495466] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-[16px] placeholder:text-[16px] caret-white"
                placeholder="johndoe"
                required
                minLength={3}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[#8e98a8] mb-1 text-[13px] font-medium ml-1">
              Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <FiMail className="text-[#596377] text-[18px] group-focus-within:text-gray-300 transition-colors" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-[#111] border border-[#222] rounded-xl text-gray-200 placeholder-[#495466] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-[16px] placeholder:text-[16px] caret-white"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[#8e98a8] mb-1 text-[13px] font-medium ml-1">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <FiLock className="text-[#596377] text-[18px] group-focus-within:text-gray-300 transition-colors" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-[#111] border border-[#222] rounded-xl text-gray-200 placeholder-[#495466] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-[16px] placeholder:text-[16px] caret-white tracking-[0.2em]"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[#8e98a8] mb-1 text-[13px] font-medium ml-1">
              Confirm Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <FiLock className="text-[#596377] text-[18px] group-focus-within:text-gray-300 transition-colors" />
              </div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-[#111] border border-[#222] rounded-xl text-gray-200 placeholder-[#495466] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-[16px] placeholder:text-[16px] caret-white tracking-[0.2em]"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-secondary text-black font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-lg shadow-primary/10 active:scale-[0.98] text-[17px]"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-[#8e98a8] text-[15px]">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-secondary transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
