import { useState, useEffect, useCallback } from 'react';
import type { Chat, Message } from '../types';
import api from '../services/api';

interface ApiError {
  response?: {
    data?: {
      message: string;
    };
  };
  message: string;
}

export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching chats from API...');
      
      const response = await api.get('/chats');
      console.log('Chats API response:', response.data);
      
      setChats(response.data);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || apiError.message || 'Failed to fetch chats');
      console.error('Error fetching chats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createChat = async (firstName: string, lastName: string): Promise<Chat | null> => {
    try {
      const response = await api.post('/chats', { firstName, lastName });
      const newChat = response.data;
      setChats(prev => [newChat, ...prev]);
      return newChat;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || apiError.message || 'Failed to create chat');
      console.error('Error creating chat:', err);
      return null;
    }
  };

  const updateChat = async (chatId: string, updates: { firstName?: string; lastName?: string }): Promise<boolean> => {
    try {
      const response = await api.put(`/chats/${chatId}`, updates);
      const updatedChat = response.data;
      setChats(prev => prev.map(chat => 
        chat._id === chatId ? { ...chat, ...updatedChat } : chat
      ));
      return true;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || apiError.message || 'Failed to update chat');
      console.error('Error updating chat:', err);
      return false;
    }
  };

  const deleteChat = async (chatId: string): Promise<boolean> => {
    try {
      await api.delete(`/chats/${chatId}`);
      setChats(prev => prev.filter(chat => chat._id !== chatId));
      return true;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || apiError.message || 'Failed to delete chat');
      console.error('Error deleting chat:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const updateChatLastMessage = useCallback((chatId: string, newMessage: Message): void => {
    setChats(prev => prev.map(chat => {
      if (chat._id === chatId) {
        // Создаем новый массив сообщений с новым сообщением в конце
        const updatedMessages = [...(chat.messages || []), newMessage];
        return {
          ...chat,
          messages: updatedMessages
        };
      }
      return chat;
    }));
  }, []);

  return {
    chats,
    loading,
    error,
    refetch: fetchChats,
    createChat,
    updateChat,
    deleteChat,
    updateChatLastMessage
  };
};