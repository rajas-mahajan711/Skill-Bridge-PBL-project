import api from './api';
import { AuthResponse, User } from '../types/user';
import { mockStudentProfile } from './mockData';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const res = await api.post<AuthResponse>('/auth/login', { email, password });
      return res.data;
    } catch (err: any) {
      // If backend is unreachable or demo credentials are used, provide demo session fallback
      if (!err.response || err.code === 'ERR_NETWORK' || email === 'student@skillbridge.edu') {
        console.warn('[authService] Backend offline or demo login requested; establishing demo student session.');
        const fallbackUser: User = {
          id: mockStudentProfile.user?.id || 'usr-student-001',
          _id: mockStudentProfile.user?._id || 'usr-student-001',
          name: mockStudentProfile.user?.name || 'Aamrapali More',
          email: mockStudentProfile.user?.email || 'aamrapali.more@mitwpu.edu.in',
          role: 'student',
        };
        return {
          success: true,
          token: 'demo-jwt-token-' + Date.now(),
          user: fallbackUser,
          profile: mockStudentProfile,
        };
      }
      throw err;
    }
  },

  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    try {
      const res = await api.post<AuthResponse>('/auth/register', { name, email, password, role: 'student' });
      return res.data;
    } catch (err: any) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        console.warn('[authService] Backend offline, registering in demo mode.');
        const demoUser: User = {
          id: 'user-' + Date.now(),
          _id: 'user-' + Date.now(),
          name,
          email,
          role: 'student',
        };
        const demoProfile = {
          ...mockStudentProfile,
          user: demoUser,
        };
        return {
          success: true,
          token: 'demo-jwt-token-' + Date.now(),
          user: demoUser,
          profile: demoProfile,
        };
      }
      throw err;
    }
  },

  getMe: async (): Promise<any> => {
    try {
      const res = await api.get('/auth/me');
      return res.data;
    } catch (err) {
      const savedUser = localStorage.getItem('skillbridge_user');
      const savedProfile = localStorage.getItem('skillbridge_demo_profile');
      if (savedUser) {
        return {
          success: true,
          user: JSON.parse(savedUser),
          profile: savedProfile ? JSON.parse(savedProfile) : mockStudentProfile,
        };
      }
      return {
        success: true,
        user: mockStudentProfile.user,
        profile: mockStudentProfile,
      };
    }
  },
};
