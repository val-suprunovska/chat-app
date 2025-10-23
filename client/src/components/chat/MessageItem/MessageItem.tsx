import React, { useState } from 'react';
import type { Message } from '../../../types';
import { Icon } from '../../ui/Icon/Icon';
import './MessageItem.css';

interface MessageItemProps {
  message: Message;
  onUpdate: () => void;
  onUpdateMessage: (messageId: string, newContent: string) => Promise<boolean>;
}

export const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  onUpdate, 
  onUpdateMessage 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isUserMessage = message.sender === 'user';

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEdited = () => {
    if (!message.updatedAt || !message.createdAt) return false;
    const updated = new Date(message.updatedAt);
    const created = new Date(message.createdAt);
    return updated.getTime() - created.getTime() > 1000;
  };

  const handleEdit = async () => {
    if (editContent.trim() === message.content) {
      setIsEditing(false);
      return;
    }

    if (!editContent.trim()) {
      setEditContent(message.content);
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onUpdateMessage(message._id, editContent.trim());
      if (success) {
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Error saving message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={`message ${isUserMessage ? 'user' : 'system'}`}>
      <div className="message-bubble">
        {isEditing ? (
          <div className="edit-form">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyPress}
              className="edit-input"
              autoFocus
              disabled={isSubmitting}
              rows={2}
            />
            <div className="edit-actions">
              <button
                onClick={handleEdit}
                disabled={isSubmitting || !editContent.trim()}
                className="edit-button edit-save"
              >
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="edit-button edit-cancel"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <div className="message-content-wrapper">
            <div className="message-content">
              {message.content}
            </div>
            <div className="message-meta">
              <span className="message-time">
                {formatTime(message.createdAt)}
                {isEdited() && ' (ред.)'}
              </span>
              {isUserMessage && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="message-edit"
                  title="Редактировать"
                >
                  <Icon name="edit" size={12} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};