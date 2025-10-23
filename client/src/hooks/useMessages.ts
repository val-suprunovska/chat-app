import { useState, useEffect, useCallback } from 'react';
import type { Message } from '../types';
import api from '../services/api';

interface ApiError {
  response?: {
    data?: {
      message: string;
    };
  };
  message: string;
}

export const useMessages = (chatId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async (): Promise<void> => {
    if (!chatId) {
      console.log('No chatId provided, clearing messages');
      setMessages([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching messages for chat: ${chatId}`);
      
      const response = await api.get(`/messages/${chatId}`);
      console.log(`Messages API response for chat ${chatId}:`, response.data);
      
      setMessages(response.data);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || apiError.message || 'Failed to fetch messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  const sendMessage = async (content: string): Promise<Message | null> => {
    if (!chatId) {
      console.log('Cannot send message: no chatId');
      return null;
    }

    try {
      console.log(`=== FRONTEND: Sending message ===`);
      console.log(`Chat ID: ${chatId}`);
      console.log(`Content: ${content}`);
      
      const response = await api.post(`/messages/${chatId}`, { content });
      const newMessage = response.data;
      
      console.log('Message sent successfully:', newMessage);
      
      // Добавляем сообщение в локальное состояние
      setMessages(prev => [...prev, newMessage]);
      
      return newMessage;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      const errorMsg = apiError.response?.data?.message || apiError.message || 'Failed to send message';
      setError(errorMsg);
      console.error('Error sending message:', err);
      console.error('Error details:', apiError.response?.data);
      return null;
    }
  };

  const updateMessage = async (messageId: string, content: string): Promise<boolean> => {
    try {
      console.log(`=== FRONTEND: Updating message ===`);
      console.log(`Message ID: ${messageId}`);
      console.log(`New content: ${content}`);
      
      const response = await api.put(`/messages/${messageId}`, { content });
      const updatedMessage = response.data;
      
      console.log('Message updated successfully:', updatedMessage);
      
      // Обновляем сообщение в локальном состоянии
      setMessages(prev => prev.map(msg =>
        msg._id === messageId ? { ...msg, ...updatedMessage } : msg
      ));
      
      return true;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      const errorMsg = apiError.response?.data?.message || apiError.message || 'Failed to update message';
      setError(errorMsg);
      console.error('Error updating message:', err);
      console.error('Error details:', apiError.response?.data);
      return false;
    }
  };

  const addMessage = (message: Message): void => {
    console.log('Adding new message to state:', message);
    setMessages(prev => [...prev, message]);
  };

  const clearMessages = (): void => {
    setMessages([]);
  };

  useEffect(() => {
    console.log('useMessages: chatId changed to:', chatId);
    fetchMessages();
  }, [chatId, fetchMessages]);

  // Логируем изменения messages
  useEffect(() => {
    console.log('Messages state updated:', messages);
  }, [messages]);

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages,
    sendMessage,
    updateMessage,
    addMessage,
    clearMessages
  };
};