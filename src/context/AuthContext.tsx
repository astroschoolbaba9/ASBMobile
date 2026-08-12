// mobile-app/src/context/AuthContext.tsx
// Universal Cross-Platform Single Sign-On (SSO) & Auth Context

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as Linking from 'expo-linking';
import { crystalApi, getStoredToken, saveStoredToken, removeStoredToken } from '../api/client';

export interface UserProfile {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  role?: string;
  credits?: number;
  addresses?: any[];
  createdAt?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginPassword: (identifier: string, password: string) => Promise<UserProfile>;
  registerPassword: (data: { name: string; email: string; phone: string; password: string }) => Promise<UserProfile>;
  sendOtp: (identifier: string) => Promise<any>;
  verifyOtp: (identifier: string, otp: string) => Promise<UserProfile>;
  completeProfile: (data: { name: string; dob: string; gender: string }) => Promise<any>;
  updateDob: (dob: string) => Promise<void>;
  updateProfile: (data: { name?: string; dob?: string; email?: string; phone?: string; gender?: string }) => Promise<void>;
  handleSsoToken: (ssoToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const storedToken = await getStoredToken();
    if (!storedToken) {
      setUser(null);
      setTokenState(null);
      setLoading(false);
      return;
    }
    try {
      setTokenState(storedToken);
      const res = await crystalApi.get('/api/auth/me');
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        await removeStoredToken();
        setUser(null);
        setTokenState(null);
      }
    } catch (e) {
      await removeStoredToken();
      setUser(null);
      setTokenState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSsoToken = useCallback(async (ssoToken: string) => {
    if (!ssoToken) return;
    setLoading(true);
    try {
      await saveStoredToken(ssoToken);
      setTokenState(ssoToken);
      const res = await crystalApi.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${ssoToken}`, 'X-Auth-Token': ssoToken }
      });
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
      }
    } catch (error) {
      console.error('SSO Token Validation Failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Universal Deep Link SSO Listener (asb://auth/sso?token=...)
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const data = Linking.parse(event.url);
      const ssoToken = (data.queryParams?.token || data.queryParams?.sso_token) as string;
      if (ssoToken) {
        handleSsoToken(ssoToken);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) {
        const data = Linking.parse(url);
        const ssoToken = (data.queryParams?.token || data.queryParams?.sso_token) as string;
        if (ssoToken) {
          handleSsoToken(ssoToken);
          return;
        }
      }
      fetchMe();
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [fetchMe, handleSsoToken]);

  const loginPassword = async (identifier: string, password: string) => {
    const res = await crystalApi.post('/api/auth/login', { identifier, password });
    if (res.data?.success) {
      const accessToken = res.data.accessToken || res.data.token;
      await saveStoredToken(accessToken);
      setTokenState(accessToken);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const registerPassword = async (data: { name: string; email: string; phone: string; password: string }) => {
    const res = await crystalApi.post('/api/auth/register', data);
    if (res.data?.success) {
      const accessToken = res.data.accessToken || res.data.token;
      await saveStoredToken(accessToken);
      setTokenState(accessToken);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const sendOtp = async (identifier: string) => {
    const res = await crystalApi.post('/api/auth/send-otp', { identifier });
    return res.data;
  };

  const verifyOtp = async (identifier: string, otp: string) => {
    const res = await crystalApi.post('/api/auth/verify-otp', { identifier, otp });
    if (res.data?.success) {
      const accessToken = res.data.accessToken || res.data.token;
      await saveStoredToken(accessToken);
      setTokenState(accessToken);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.data?.message || 'OTP verification failed');
  };

  const completeProfile = async (data: { name: string; dob: string; gender: string }) => {
    setUser((prev) => (prev ? { ...prev, ...data } : { _id: 'guest', ...data }));
    try {
      const res = await crystalApi.post('/api/auth/complete-profile', data);
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
      }
      return res.data;
    } catch (e) {
      console.warn('Failed to sync complete-profile with backend, updated locally:', e);
      return { success: true };
    }
  };

  const updateDob = async (newDob: string) => {
    if (!newDob) return;
    try {
      setUser((prev) => (prev ? { ...prev, dob: newDob } : null));
      if (token) {
        await crystalApi.post('/api/auth/complete-profile', { dob: newDob });
      }
    } catch (e) {
      console.warn('Failed to sync DOB with backend, updated locally:', e);
    }
  };

  const updateProfile = async (data: { name?: string; dob?: string; email?: string; phone?: string; gender?: string }) => {
    try {
      setUser((prev) => (prev ? { ...prev, ...data } : null));
      if (token) {
        await crystalApi.post('/api/auth/complete-profile', data);
      }
    } catch (e) {
      console.warn('Failed to sync profile with backend, updated locally:', e);
    }
  };

  const logout = async () => {
    await removeStoredToken();
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        loginPassword,
        registerPassword,
        sendOtp,
        verifyOtp,
        completeProfile,
        updateDob,
        updateProfile,
        handleSsoToken,
        logout,
        refreshMe: fetchMe,
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
