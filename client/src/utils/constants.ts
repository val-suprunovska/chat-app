// Автоматическое определение URL API в зависимости от среды
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://chat-app-mj66.vercel.app/api'
    : 'http://localhost:5000/api');

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.MODE === 'production'
    ? 'https://chat-app-mj66.vercel.app'
    : 'http://localhost:5000');

// Google OAuth URL
export const GOOGLE_OAUTH_URL = import.meta.env.VITE_GOOGLE_OAUTH_URL ||
  (import.meta.env.MODE === 'production'
    ? 'https://chat-app-mj66.vercel.app/api/auth/google'
    : 'http://localhost:5000/api/auth/google');