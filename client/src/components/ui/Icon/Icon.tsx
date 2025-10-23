import React from 'react';
import './Icon.css';

interface IconProps {
  name: string;
  className?: string;
  onClick?: () => void;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  className = '', 
  onClick,
  size = 20 
}) => {
  const icons: { [key: string]: string } = {
    logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    send: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    delete: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    plus: 'M12 4v16m8-8H4',
    close: 'M6 18L18 6M6 6l12 12'
  };

  const iconClass = `icon ${className}`.trim();

  if (onClick) {
    return (
      <button className="icon-button" onClick={onClick} title={name}>
        <svg
          className={iconClass}
          style={{ width: size, height: size }}
          viewBox="0 0 24 24"
        >
          <path d={icons[name]} />
        </svg>
      </button>
    );
  }

  return (
    <svg
      className={iconClass}
      style={{ width: size, height: size }}
      viewBox="0 0 24 24"
    >
      <path d={icons[name]} />
    </svg>
  );
};