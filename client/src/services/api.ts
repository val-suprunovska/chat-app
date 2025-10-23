import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: false,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - улучшенная обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let userFriendlyMessage = 'Произошла неизвестная ошибка';
    
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
      userFriendlyMessage = 'Ошибка подключения к серверу. Проверьте интернет-соединение';
    } else if (error.code === 'TIMEOUT_ERROR') {
      userFriendlyMessage = 'Сервер не отвечает. Пожалуйста, попробуйте позже';
    } else if (error.response) {
      // Сервер ответил с ошибкой
      const status = error.response.status;
      const serverMessage = error.response.data?.message;
      
      switch (status) {
        case 400:
          userFriendlyMessage = serverMessage || 'Неверный запрос';
          break;
        case 401:
          userFriendlyMessage = serverMessage || 'Необходима авторизация';
          localStorage.removeItem('token');
          delete api.defaults.headers.common.Authorization;
          break;
        case 403:
          userFriendlyMessage = serverMessage || 'Доступ запрещен';
          break;
        case 404:
          userFriendlyMessage = serverMessage || 'Ресурс не найден';
          break;
        case 500:
          userFriendlyMessage = serverMessage || 'Внутренняя ошибка сервера';
          break;
        case 502:
          userFriendlyMessage = 'Сервер временно недоступен';
          break;
        case 503:
          userFriendlyMessage = 'Сервер перегружен. Попробуйте позже';
          break;
        default:
          userFriendlyMessage = serverMessage || `Ошибка ${status}`;
      }
    } else if (error.request) {
      // Запрос был сделан, но ответ не получен
      userFriendlyMessage = 'Сервер не отвечает. Проверьте подключение к интернету';
    }
    
    // Создаем новую ошибку с понятным сообщением
    const friendlyError = new Error(userFriendlyMessage);
    friendlyError.name = error.name;
    friendlyError.stack = error.stack;
    
    return Promise.reject(friendlyError);
  }
);

export default api;