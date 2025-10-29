import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { useSocket } from './hooks/useSocket';
import { LoginForm } from './components/auth/LoginForm/LoginForm';
import { Header } from './components/layout/Header/Header';
import { ChatList } from './components/chat/ChatList/ChatList';
import { ChatHeader } from './components/chat/ChatHeader/ChatHeader';
import { MessageList } from './components/chat/MessageList/MessageList';
import { MessageInput } from './components/chat/MessageInput/MessageInput';
import { Toast } from './components/ui/Toast/Toast';
import { useChats } from './hooks/useChats';
import { useMessages } from './hooks/useMessages';
import type { Chat, Message } from './types';
import './App.css';

function App() {
  const { user, loading: authLoading, shouldRefreshChats } = useAuth();
  const { socket, isConnected } = useSocket();
  const { chats, loading: chatsLoading, refetch: refetchChats, updateChatLastMessage, reorderChats } = useChats();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const { messages, refetch: refetchMessages, updateMessage, sendMessage } = useMessages(selectedChat?._id || null);

  // Добавьте эффект для отслеживания успешной OAuth аутентификации
  useEffect(() => {
    if (shouldRefreshChats && user) {
      console.log('🔄 OAuth authentication detected, refetching chats...');
      refetchChats();
    }
  }, [shouldRefreshChats, user, refetchChats]);

  // Обработчики Socket.io событий
  useEffect(() => {
    if (socket) {
      console.log('Setting up Socket.io event listeners...');

      const handleNewMessage = (message: Message): void => {
        console.log('=== SOCKET: new_message received ===');
        console.log('Message sender:', message.sender);
        console.log('Selected chat ID:', selectedChat?._id);
        console.log('Message chat ID:', message.chatId);

        console.log('Moving chat to top:', message.chatId);
        reorderChats(message.chatId)

        // Обновляем последнее сообщение в списке чатов
        updateChatLastMessage(message.chatId, message);

        // Добавляем системные сообщения через Socket.io
        // Пользовательские сообщения уже добавлены через HTTP ответ
        if (selectedChat && message.chatId === selectedChat._id && message.sender === 'system') {
          console.log('Adding system message to current chat');
          // Перезагружаем сообщения чтобы получить актуальный список
          refetchMessages();
          
          setToast({ message: 'Новое сообщение от системы', type: 'info' });
        }
      };

      const handleMessageUpdated = (updatedMessage: Message): void => {
        console.log('=== SOCKET: message_updated received ===');
        console.log('Updated message:', updatedMessage);
        
        if (selectedChat && updatedMessage.chatId === selectedChat._id) {
          console.log('Updating message in current chat');
          // Вызываем API для обновления сообщения
          updateMessage(updatedMessage._id, updatedMessage.content)
            .then(success => {
              if (success) {
                console.log('Message updated successfully via socket');
              }
            })
            .catch(error => {
              console.error('Error updating message via socket:', error);
            });
        }
      };

      const handleError = (error: { message: string }): void => {
        console.error('Socket error:', error);
        setToast({ message: error.message, type: 'error' });
      };

      socket.on('new_message', handleNewMessage);
      socket.on('message_updated', handleMessageUpdated);
      socket.on('error', handleError);

      return () => {
        console.log('Cleaning up Socket.io event listeners...');
        socket.off('new_message', handleNewMessage);
        socket.off('message_updated', handleMessageUpdated);
        socket.off('error', handleError);
      };
    }
  }, [socket, selectedChat, updateChatLastMessage, refetchMessages, updateMessage, refetchChats, reorderChats]);

  const handleSendMessage = useCallback(async (content: string): Promise<void> => {
    console.log('=== APP: handleSendMessage ===');
    console.log('Selected chat:', selectedChat?._id);
    console.log('Content:', content);

    if (!selectedChat) {
      console.log('Cannot send message: no chat selected');
      setToast({ message: 'Выберите чат для отправки сообщения', type: 'error' });
      return;
    }

    try {
      console.log('Sending message via HTTP...');
      const result = await sendMessage(content);
      
      if (result) {
        console.log('Message sent successfully via HTTP');
        // Сообщение автоматически добавится через useMessages
      } else {
        console.log('Failed to send message via HTTP');
        setToast({ message: 'Ошибка при отправке сообщения', type: 'error' });
      }
    } catch (error) {
      console.error('HTTP send failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при отправке сообщения';
      setToast({ message: errorMessage, type: 'error' });
    }
  }, [selectedChat, sendMessage]);

  const handleSelectChat = useCallback((chat: Chat): void => {
    console.log('Selecting chat:', chat._id);
    setSelectedChat(chat);
    
    if (socket) {
      // Выходим из предыдущего чата если он был
      if (selectedChat) {
        socket.emit('leave_chat', selectedChat._id);
      }
      
      // Присоединяемся к новому чату
      socket.emit('join_chat', chat._id);
      console.log('Joined chat room:', chat._id);
    }
  }, [socket, selectedChat]);

  // Функция для обновления сообщений (передается в MessageItem)
  const handleUpdateMessage = useCallback(async (messageId: string, newContent: string): Promise<boolean> => {
    if (!selectedChat) return false;
    
    try {
      console.log('Updating message:', messageId, newContent);
      const success = await updateMessage(messageId, newContent);
      
      if (success) {
        setToast({ message: 'Сообщение обновлено', type: 'success' });
      } else {
        setToast({ message: 'Ошибка при обновлении сообщения', type: 'error' });
      }
      
      return success;
    } catch (error) {
      console.error('Error updating message:', error);
      setToast({ message: 'Ошибка при обновлении сообщения', type: 'error' });
      return false;
    }
  }, [selectedChat, updateMessage]);

  if (authLoading) {
    return <div className="app-loading">Loading...</div>;
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="app">
      <Header />
      
      <div className="app-content">
        <ChatList
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          onChatsUpdate={refetchChats}
        />
        
        <div className="chat-main">
          <ChatHeader chat={selectedChat} />
          
          {selectedChat ? (
            <>
              <MessageList
                messages={messages}
                onMessageUpdate={refetchMessages}
                onUpdateMessage={handleUpdateMessage}
              />
              <MessageInput
                onSendMessage={handleSendMessage}
                disabled={chatsLoading}
              />
              {!isConnected && (
                <div className="connection-status">
                  Соединение прервано. Сообщения отправляются через HTTP
                </div>
              )}
            </>
          ) : (
            <div className="chat-placeholder">
              Выберите чат для начала общения
            </div>
          )}
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;