import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import './LoginForm.css';

export const LoginForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOAuthRedirect, setIsOAuthRedirect] = useState(false);

  const { login, register, handleOAuthSuccess } = useAuth();

  const handleGoogleLogin = () => {
    console.log("🔐 Starting Google OAuth...");
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  useEffect(() => {
    const handleOAuthCallback = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const userId = urlParams.get("userId");

      console.log("🔍 OAuth callback parameters:", {
        token: token ? "✓" : "✗",
        userId: userId ? "✓" : "✗"
      });

      if (token && userId) {
        setIsOAuthRedirect(true);
        setLoading(true);
        
        try {
          console.log("🔄 Processing OAuth authentication...");
          await handleOAuthSuccess(token, userId);
          
          console.log("✅ OAuth authentication successful, redirecting...");
          
          // Просто перенаправляем на главную
          window.history.replaceState({}, document.title, "/");
          window.location.href = "/";
          
        } catch (error) {
          console.error("❌ OAuth authentication failed:", error);
          setError("Ошибка при входе через Google. Попробуйте еще раз.");
          setIsOAuthRedirect(false);
          setLoading(false);
        }
      }
    };

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("token") || urlParams.has("userId")) {
      console.log("🎯 OAuth callback detected in URL");
      handleOAuthCallback();
    }
  }, [handleOAuthSuccess]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email.trim()) {
      setError("Пожалуйста, введите email");
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError("Пожалуйста, введите пароль");
      setLoading(false);
      return;
    }

    if (password.length < 6 && !isLogin) {
      setError("Пароль должен содержать не менее 6 символов");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Пожалуйста, введите корректный email адрес");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Произошла неизвестная ошибка";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="login-title">
          {isLogin ? "Вход в систему" : "Регистрация"}
        </h1>

        {error && <div className="login-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            placeholder="Введите ваш email"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            placeholder="Введите ваш пароль"
            disabled={loading}
          />
          {!isLogin && (
            <div className="password-hint">
              Пароль должен содержать не менее 6 символов
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="login-button">
          {loading ? "Загрузка..." : isLogin ? "Войти" : "Зарегистрироваться"}
        </button>

        <div className="login-divider">
          <span>или</span>
        </div>

        <button 
          type="button" 
          onClick={handleGoogleLogin} 
          className="google-login-button"
          disabled={loading || isOAuthRedirect}
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Войти через Google
        </button>

        <div className="login-switch">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="switch-button"
            disabled={loading}
          >
            {isLogin
              ? "Нет аккаунта? Зарегистрироваться"
              : "Есть аккаунт? Войти"}
          </button>
        </div>
      </form>
    </div>
  );
};