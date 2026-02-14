import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,

  register: async (userData) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/register', userData);

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));

      set({
        user: data.data,
        token: data.data.token,
        loading: false
      });

      toast.success('Registration successful!');
      return data;
    } catch (error) {
      set({ loading: false });
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  },

  login: async (credentials) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/login', credentials);

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));

      set({
        user: data.data,
        token: data.data.token,
        loading: false
      });

      toast.success('Login successful!');
      return data;
    } catch (error) {
      set({ loading: false });
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null });
      toast.success('Logged out successfully');
    }
  },

  updateProfile: (userData) => {
    const updatedUser = { ...JSON.parse(localStorage.getItem('user')), ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  }
}));
