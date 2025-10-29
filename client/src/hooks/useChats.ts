import { useState, useEffect, useCallback } from "react";
import type { Chat, Message } from "../types";
import api from "../services/api";
import { useAuth } from "./useAuth";

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
  const { user } = useAuth();

  const fetchChats = useCallback(async (): Promise<void> => {
    if (!user) {
      console.log("User not authenticated, skipping chats fetch");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Fetching chats from API...");

      const response = await api.get("/chats");
      console.log("Chats API response:", response.data);

      setChats(response.data);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(
        apiError.response?.data?.message ||
          apiError.message ||
          "Failed to fetch chats"
      );
      console.error("Error fetching chats:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Функция для перемещения чата наверх при новом сообщении
  const reorderChats = useCallback((chatId: string): void => {
    console.log("Reordering chats, moving chat to top:", chatId);

    setChats((prevChats) => {
      // Находим чат который нужно переместить
      const chatToMove = prevChats.find((chat) => chat._id === chatId);
      if (!chatToMove) {
        console.log("Chat not found for reordering:", chatId);
        return prevChats;
      }

      // Убираем чат из текущей позиции
      const otherChats = prevChats.filter((chat) => chat._id !== chatId);

      // Создаем новый массив с чатом наверху
      const reorderedChats = [chatToMove, ...otherChats];

      console.log(
        "Chats reordered. New order:",
        reorderedChats.map((chat) => ({
          id: chat._id,
          name: `${chat.firstName} ${chat.lastName}`,
        }))
      );

      return reorderedChats;
    });
  }, []);

  const createChat = async (
    firstName: string,
    lastName: string
  ): Promise<Chat | null> => {
    try {
      const response = await api.post("/chats", { firstName, lastName });
      const newChat = response.data;
      setChats((prev) => [newChat, ...prev]); // Новый чат сразу добавляется наверх
      return newChat;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(
        apiError.response?.data?.message ||
          apiError.message ||
          "Failed to create chat"
      );
      console.error("Error creating chat:", err);
      return null;
    }
  };

  const updateChat = async (
    chatId: string,
    updates: { firstName?: string; lastName?: string }
  ): Promise<boolean> => {
    try {
      const response = await api.put(`/chats/${chatId}`, updates);
      const updatedChat = response.data;
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === chatId ? { ...chat, ...updatedChat } : chat
        )
      );
      return true;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(
        apiError.response?.data?.message ||
          apiError.message ||
          "Failed to update chat"
      );
      console.error("Error updating chat:", err);
      return false;
    }
  };

  const deleteChat = async (chatId: string): Promise<boolean> => {
    try {
      await api.delete(`/chats/${chatId}`);
      setChats((prev) => prev.filter((chat) => chat._id !== chatId));
      return true;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(
        apiError.response?.data?.message ||
          apiError.message ||
          "Failed to delete chat"
      );
      console.error("Error deleting chat:", err);
      return false;
    }
  };

  const updateChatLastMessage = useCallback(
    (chatId: string, newMessage: Message): void => {
      console.log("Updating last message and reordering chat:", chatId);

      setChats((prev) => {
        // Сначала обновляем сообщение в чате
        const updatedChats = prev.map((chat) => {
          if (chat._id === chatId) {
            const updatedMessages = [...(chat.messages || []), newMessage];
            return {
              ...chat,
              messages: updatedMessages,
            };
          }
          return chat;
        });

        // Затем перемещаем чат наверх
        const chatToMove = updatedChats.find((chat) => chat._id === chatId);
        if (!chatToMove) return updatedChats;

        const otherChats = updatedChats.filter((chat) => chat._id !== chatId);
        return [chatToMove, ...otherChats];
      });
    },
    []
  );

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);


  return {
    chats,
    loading,
    error,
    refetch: fetchChats,
    createChat,
    updateChat,
    deleteChat,
    updateChatLastMessage,
    reorderChats,
  };
};