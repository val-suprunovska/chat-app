import React, { useEffect, useRef } from 'react';
import type { Message } from '../../../types';
import { MessageItem } from '../MessageItem/MessageItem';
import './MessageList.css';

interface MessageListProps {
  messages: Message[];
  onMessageUpdate: () => void;
  onUpdateMessage: (messageId: string, newContent: string) => Promise<boolean>;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  onMessageUpdate,
  onUpdateMessage
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="message-list-empty">
        Нет сообщений. Начните общение!
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map(message => (
        <MessageItem
          key={message._id}
          message={message}
          onUpdate={onMessageUpdate}
          onUpdateMessage={onUpdateMessage}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};