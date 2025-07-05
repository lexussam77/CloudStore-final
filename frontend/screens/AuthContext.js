import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from './api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [jwt, setJwt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount, check for JWT in AsyncStorage
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('jwt');
      setJwt(token);
      setLoading(false);
    };
    checkToken();
  }, []);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    if (res.token) {
      await AsyncStorage.setItem('jwt', res.token);
      setJwt(res.token);
      return { success: true };
    } else {
      return { success: false, message: res.message || 'Invalid credentials.' };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('jwt');
    setJwt(null);
  };

  return (
    <AuthContext.Provider value={{ jwt, setJwt, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
} 