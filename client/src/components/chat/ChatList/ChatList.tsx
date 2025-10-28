import React, { useState } from 'react';
import type { Chat } from '../../../types';
import { ChatItem } from '../ChatItem/ChatItem';
import { Icon } from '../../ui/Icon/Icon';
import { Modal } from '../../ui/Modal/Modal';
import { SidebarResizer } from '../../ui/SidebarResizer/SidebarResizer';
import { useSidebar } from '../../../contexts/SidebarContext';
import api from '../../../services/api';
import './ChatList.css';

interface ChatListProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onChatsUpdate: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChat,
  onSelectChat,
  onChatsUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChatFirstName, setNewChatFirstName] = useState('');
  const [newChatLastName, setNewChatLastName] = useState('');
  
  const { 
    isCollapsed, 
    sidebarWidth, 
    toggleSidebar 
  } = useSidebar();

  const filteredChats = chats.filter(chat =>
    `${chat.firstName} ${chat.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateChat = async (): Promise<void> => {
    if (!newChatFirstName || !newChatLastName) return;

    try {
      await api.post('/chats', {
        firstName: newChatFirstName,
        lastName: newChatLastName
      });
      setIsModalOpen(false);
      setNewChatFirstName('');
      setNewChatLastName('');
      onChatsUpdate();
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <>
      {/* Overlay для мобильных устройств */}
      {!isCollapsed && window.innerWidth <= 768 && (
        <div 
          className="mobile-overlay" 
          onClick={toggleSidebar}
        />
      )}

      <div 
        className={`chat-list ${isCollapsed ? 'collapsed' : ''}`}
        style={{ width: isCollapsed ? 60 : sidebarWidth }}
      >
        <div className="chat-list-header">
          {!isCollapsed ? (
            <>
              <div className="chat-list-title">
                <span className="chat-list-title-text">Чаты</span>
                <div className="chat-list-controls">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="control-button"
                    title="Создать новый чат"
                  >
                    <Icon name="plus" />
                  </button>
                  <button
                    onClick={toggleSidebar}
                    className="control-button"
                    title="Свернуть панель"
                  >
                    <Icon name="close" />
                  </button>
                </div>
              </div>
              
              <div className="chat-search">
                <div className="search-icon">
                  <Icon name="search" />
                </div>
                <input
                  type="text"
                  placeholder="Поиск чатов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </>
          ) : (
            <div className="collapsed-content">
              <button
                onClick={() => setIsModalOpen(true)}
                className="control-button"
                title="Создать новый чат"
              >
                <Icon name="plus" />
              </button>
              <button
                onClick={toggleSidebar}
                className="control-button"
                title="Развернуть панель"
              >
                <Icon name="search" />
              </button>
            </div>
          )}
        </div>

        <div className="chat-list-items">
          {!isCollapsed ? (
            filteredChats.map(chat => (
              <ChatItem
                key={chat._id}
                chat={chat}
                isSelected={selectedChat?._id === chat._id}
                onSelect={onSelectChat}
                onUpdate={onChatsUpdate}
              />
            ))
          ) : (
            <div className="collapsed-content">
              {filteredChats.map(chat => (
                <div
                  key={chat._id}
                  className={`collapsed-chat-item ${
                    selectedChat?._id === chat._id ? 'selected' : ''
                  }`}
                  onClick={() => onSelectChat(chat)}
                  title={`${chat.firstName} ${chat.lastName}`}
                >
                  {getInitials(chat.firstName, chat.lastName)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Добавляем возможность изменения размера перетаскиванием */}
        {!isCollapsed && <SidebarResizer />}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Создать новый чат"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', color: '#495057' }}>
              Имя
            </label>
            <input
              type="text"
              value={newChatFirstName}
              onChange={(e) => setNewChatFirstName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e9ecef',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', color: '#495057' }}>
              Фамилия
            </label>
            <input
              type="text"
              value={newChatLastName}
              onChange={(e) => setNewChatLastName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e9ecef',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          <button
            onClick={handleCreateChat}
            disabled={!newChatFirstName || !newChatLastName}
            style={{
              width: '100%',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              padding: '10px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: !newChatFirstName || !newChatLastName ? 'not-allowed' : 'pointer',
              opacity: !newChatFirstName || !newChatLastName ? 0.6 : 1
            }}
          >
            Создать чат
          </button>
        </div>
      </Modal>
    </>
  );
};