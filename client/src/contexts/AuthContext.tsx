import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthContextType } from '../types';
import api from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Проверяем токен через специальный эндпоинт
      const verifyToken = async () => {
        try {
          const response = await api.get('/auth/verify');
          const userData: User = {
            _id: response.data._id,
            email: response.data.email,
            token
          };
          setUser(userData);
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          setUser(null);
        } finally {
          setLoading(false);
        }
      };
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await api.post('/auth/login', { email, password });
      const userData = response.data;
      
      setUser(userData);
      localStorage.setItem('token', userData.token);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: unknown) {
      // Ошибка уже обработана в интерцепторе, просто пробрасываем дальше
      throw error;
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await api.post('/auth/register', { email, password });
      const userData = response.data;
      
      setUser(userData);
      localStorage.setItem('token', userData.token);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: unknown) {
      // Ошибка уже обработана в интерцепторе, просто пробрасываем дальше
      throw error;
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };