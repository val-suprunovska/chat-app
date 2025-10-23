import React, { useState } from 'react';
import type { Chat } from '../../../types';
import { Icon } from '../../ui/Icon/Icon';
import { Modal } from '../../ui/Modal/Modal';
import api from '../../../services/api';
import './ChatItem.css';

interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
  onSelect: (chat: Chat) => void;
  onUpdate: () => void;
}

export const ChatItem: React.FC<ChatItemProps> = ({
  chat,
  isSelected,
  onSelect,
  onUpdate
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState(chat.firstName);
  const [editLastName, setEditLastName] = useState(chat.lastName);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      // Сегодня - показываем время
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 48) {
      // Вчера
      return 'Yesterday';
    } else {
      // Более 2 дней назад - показываем дату
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const getLastMessage = () => {
    const messages = chat.messages || [];
    const lastMessage = messages[messages.length - 1];
    
    if (!lastMessage) {
      return {
        content: 'No messages',
        time: ''
      };
    }

    return {
      content: lastMessage.content,
      time: formatTime(lastMessage.createdAt)
    };
  };

  const lastMessage = getLastMessage();

  const handleDelete = async (): Promise<void> => {
    if (window.confirm('Are you sure you want to delete chat?')) {
      try {
        await api.delete(`/chats/${chat._id}`);
        onUpdate();
      } catch (err: unknown) {
        console.error('Failed to delete chat:', err);
      }
    }
  };

  const handleEdit = async (): Promise<void> => {
    try {
      await api.put(`/chats/${chat._id}`, {
        firstName: editFirstName,
        lastName: editLastName
      });
      setIsEditModalOpen(false);
      onUpdate();
    } catch (err: unknown) {
      console.error('Failed to update chat:', err);
    }
  };

  return (
    <>
      <div
        className={`chat-item ${isSelected ? 'selected' : ''}`}
        onClick={() => onSelect(chat)}
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
      >
        <div className="chat-item-content">
          <div className="chat-avatar">
            {getInitials(chat.firstName, chat.lastName)}
          </div>
          
          <div className="chat-info">
            <div className="chat-header">
              <h3 className="chat-name">
                {chat.firstName} {chat.lastName}
              </h3>
              {lastMessage.time && (
                <span className="chat-time">
                  {lastMessage.time}
                </span>
              )}
              {showMenu && (
                <div className="chat-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditModalOpen(true);
                    }}
                    className="action-button edit-button"
                    title="Редактировать"
                  >
                    <Icon name="edit" size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className="action-button delete-button"
                    title="Удалить"
                  >
                    <Icon name="delete" size={16} />
                  </button>
                </div>
              )}
            </div>
            <p className="chat-last-message">
              {lastMessage.content}
            </p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Редактировать чат"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', color: '#495057' }}>
              Name
            </label>
            <input
              type="text"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
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
              Lastname
            </label>
            <input
              type="text"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
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
            onClick={handleEdit}
            disabled={!editFirstName || !editLastName}
            style={{
              width: '100%',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              padding: '10px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: !editFirstName || !editLastName ? 'not-allowed' : 'pointer',
              opacity: !editFirstName || !editLastName ? 0.6 : 1
            }}
          >
            Save
          </button>
        </div>
      </Modal>
    </>
  );
};