import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import './LoginForm.css';

export const LoginForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // валидация на фронтенде
    if (!email.trim()) {
      setError('Пожалуйста, введите email');
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Пожалуйста, введите пароль');
      setLoading(false);
      return;
    }

    if (password.length < 6 && !isLogin) {
      setError('Пароль должен содержать не менее 6 символов');
      setLoading(false);
      return;
    }

    // валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Пожалуйста, введите корректный email адрес');
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
      const errorMessage = err instanceof Error ? err.message : 'Произошла неизвестная ошибка';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="login-title">
          {isLogin ? 'Вход в систему' : 'Регистрация'}
        </h1>
        
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

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

        <button
          type="submit"
          disabled={loading}
          className="login-button"
        >
          {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
        </button>

        <div className="login-switch">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="switch-button"
            disabled={loading}
          >
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Есть аккаунт? Войти'}
          </button>
        </div>
      </form>
    </div>
  );
};