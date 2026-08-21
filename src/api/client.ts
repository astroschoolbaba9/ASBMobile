// mobile-app/src/api/client.ts
// Unified Axios API Gateway for All 4 ASB Domains

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_ENDPOINTS } from './config';

import { Platform } from 'react-native';

const TOKEN_KEY = 'asb_access_token';

export async function getStoredToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    return null;
  }
}

export async function saveStoredToken(token: string): Promise<void> {
  try {
    if (token) {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } else {
      await removeStoredToken();
    }
  } catch (error) {
    console.error('Failed to save token:', error);
  }
}

export async function removeStoredToken(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
}

// DOB Date Format Helper: Ensures DOB is passed as DD-MM-YYYY for Python Backends
export function formatDobForApi(dob?: string): string {
  if (!dob) return '';
  let clean = dob.replace(/\//g, '-').replace(/\./g, '-').trim();
  const parts = clean.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return clean;
}

// Helper to normalize image URLs from MERN API (e.g. /uploads/products/xxx.webp)
export function getImageUrl(path?: string): string {
  if (!path) return 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=400';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_ENDPOINTS.CRYSTAL_BASE}${cleanPath}`;
}

// 1. Crystal / MERN Master Auth Client
export const crystalApi = axios.create({
  baseURL: API_ENDPOINTS.CRYSTAL_BASE,
  timeout: 30000,
});

// 2. Main Reports & AI FastAPI Client
export const reportApi = axios.create({
  baseURL: API_ENDPOINTS.REPORT_BASE,
  timeout: 180000, // 3 min for AI & PDF generation
});

// 3. Name Numerology Flask Client
export const nameApi = axios.create({
  baseURL: API_ENDPOINTS.NAME_BASE,
  timeout: 30000,
});

// 4. Mobile Numerology Flask Client
export const mobileApi = axios.create({
  baseURL: API_ENDPOINTS.MOBILE_BASE,
  timeout: 30000,
});

// Attach Authorization & X-Auth-Token headers to all outgoing requests
const clients = [crystalApi, reportApi, nameApi, mobileApi];

clients.forEach((client) => {
  client.interceptors.request.use(async (config) => {
    const token = await getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['X-Auth-Token'] = token;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (!error.response) {
        error.userFriendlyMessage = '✨ Connection Issue: Unable to connect to ASB servers. Please check your internet connection and try again.';
      } else {
        const status = error.response.status;
        const serverMsg = error.response.data?.message || error.response.data?.error || error.response.data?.detail;

        if (status === 409) {
          error.userFriendlyMessage = serverMsg || '📧 Account Exists: An account with this email address or phone number is already registered. Please log in instead.';
        } else if (status === 401 || status === 403) {
          error.userFriendlyMessage = '🔐 Session Expired: Please log in again to continue.';
        } else if (status === 400 || status === 422) {
          error.userFriendlyMessage = serverMsg || '✨ Request Note: Please verify your input details and try again.';
        } else if (status === 404) {
          error.userFriendlyMessage = serverMsg || '🌸 Item Not Found: The requested information or product could not be located.';
        } else if (status >= 500) {
          error.userFriendlyMessage = '✨ Cosmic Processing Note: Our servers are busy computing calculations. Please retry in a moment.';
        } else {
          error.userFriendlyMessage = serverMsg || '✨ Request Note: Please verify your input and try again.';
        }
      }
      return Promise.reject(error);
    }
  );
});

