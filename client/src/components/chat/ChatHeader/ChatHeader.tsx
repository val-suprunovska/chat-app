import React from 'react';
import type { Chat } from '../../../types';
import './ChatHeader.css';

interface ChatHeaderProps {
  chat: Chat | null;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ chat }) => {
  if (!chat) {
    return (
      <div className="chat-header">
        <h2 className="chat-header-title" style={{ color: '#6c757d', margin: 0 }}>
          Выберите чат для начала общения
        </h2>
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="chat-header">
      <div className="chat-header-content">
        <div className="chat-header-avatar">
          {getInitials(chat.firstName, chat.lastName)}
        </div>
        <div className="chat-header-info">
          <h2>
            {chat.firstName} {chat.lastName}
          </h2>
          <p>Online</p>
        </div>
      </div>
    </div>
  );
};