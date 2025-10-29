import React, { createContext, useState, useEffect, type ReactNode } from "react";
import type { User, AuthContextType } from "../types";
import api from "../services/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [shouldRefreshChats, setShouldRefreshChats] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await api.post("/auth/login", { email, password });
    const userData = response.data;

    setUser(userData);
    localStorage.setItem("token", userData.token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const register = async (email: string, password: string): Promise<void> => {
    const response = await api.post("/auth/register", { email, password });
    const userData = response.data;

    setUser(userData);
    localStorage.setItem("token", userData.token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleOAuthSuccess = async (
    token: string,
    userId: string
  ): Promise<void> => {
    console.log("🔄 handleOAuthSuccess called with:", { token, userId });

    // Сначала сохраняем токен в localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);

    try {
      // Ждем немного чтобы axios успел подхватить токен
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Затем делаем запрос для получения данных пользователя
      const response = await api.get(`/auth/oauth/success?token=${token}`);
      const userData = response.data;

      console.log("✅ User data received from server:", userData);

      // ОБЯЗАТЕЛЬНО обновляем состояние пользователя
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      console.log("✅ User state updated in context");

      // Устанавливаем флаг для обновления чатов
      setShouldRefreshChats(true);
      console.log("✅ Chat refresh flag set");
    } catch (error) {
      console.error("❌ Error in handleOAuthSuccess:", error);
      throw error;
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    handleOAuthSuccess,
    loading,
    shouldRefreshChats, // Добавляем в контекст
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };