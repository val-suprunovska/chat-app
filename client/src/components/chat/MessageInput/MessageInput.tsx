import React, { useState } from 'react';
import { Icon } from '../../ui/Icon/Icon';
import './MessageInput.css';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== MESSAGE INPUT: handleSubmit ===');
    console.log('Message:', message);
    console.log('Disabled:', disabled);
    
    if (message.trim() && !disabled) {
      console.log('Calling onSendMessage...');
      onSendMessage(message.trim());
      setMessage('');
      console.log('Message input cleared');
    } else {
      console.log('Message not sent - empty or disabled');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log('Enter key pressed');
      handleSubmit(e);
    }
  };

  return (
    <div className="message-input">
      <form onSubmit={handleSubmit} className="message-input-form">
        <div className="message-input-field">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите сообщение..."
            disabled={disabled}
            className="message-input-text"
            rows={1}
          />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="message-send-button"
          title="Отправить сообщение"
        >
          <Icon name="send" />
        </button>
      </form>
    </div>
  );
};