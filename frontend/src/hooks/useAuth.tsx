import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/user';
import { StudentProfile } from '../types/profile';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfileState: (updated: Partial<StudentProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('skillbridge_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('skillbridge_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSession = async () => {
    const savedToken = localStorage.getItem('skillbridge_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }
    try {
      const data = await authService.getMe();
      if (data && data.user) {
        setUser(data.user);
        setProfile(data.profile || null);
        localStorage.setItem('skillbridge_user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.warn('[useAuth] Session token validation failed; clearing stored credentials.');
      localStorage.removeItem('skillbridge_token');
      localStorage.removeItem('skillbridge_user');
      setUser(null);
      setProfile(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('skillbridge_token', data.token);
      localStorage.setItem('skillbridge_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setProfile(data.profile || null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const data = await authService.register(name, email, password);
      localStorage.setItem('skillbridge_token', data.token);
      localStorage.setItem('skillbridge_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setProfile(data.profile || null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('skillbridge_token');
    localStorage.removeItem('skillbridge_user');
    setToken(null);
    setUser(null);
    setProfile(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    await fetchSession();
  };

  const updateProfileState = (updated: Partial<StudentProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...updated } : (updated as StudentProfile)));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        refreshUser,
        updateProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
