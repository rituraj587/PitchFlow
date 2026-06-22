import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Determine base API url (fallback to localhost:8000)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
axios.defaults.baseURL = API_URL;

// JWT payload decoding helper
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

// Global Axios request interceptor
axios.interceptors.request.use(
  (config) => {
    // Inject Auth token if exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Inject temporary OpenAI / Gemini API keys from sessionStorage
    const openaiKey = sessionStorage.getItem('openai_key');
    if (openaiKey) {
      config.headers['X-OpenAI-Key'] = openaiKey;
    }

    const geminiKey = sessionStorage.getItem('gemini_key');
    if (geminiKey) {
      config.headers['X-Gemini-Key'] = geminiKey;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser({
          email: decoded.sub,
          isAdmin: decoded.is_admin || false,
        });
      } else {
        // Token expired
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', { email, password });
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    const decoded = parseJwt(access_token);
    setUser({
      email: decoded.sub,
      isAdmin: decoded.is_admin || false,
    });
    return decoded;
  };

  const signup = async (email, password) => {
    const response = await axios.post('/api/auth/signup', { email, password });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    // Also clean session storage of keys for complete security
    sessionStorage.removeItem('openai_key');
    sessionStorage.removeItem('gemini_key');
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    loading,
    login,
    signup,
    logout,
    apiUrl: API_URL
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
