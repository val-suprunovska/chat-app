import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Icon } from '../../ui/Icon/Icon';
import './Header.css';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-user">
          <div className="user-avatar">
            {user && getInitials(user.email)}
          </div>
          <span className="user-email">{user?.email}</span>
        </div>
        <button
          onClick={logout}
          className="logout-button"
          title="Выйти"
        >
          <Icon name="logout" />
        </button>
      </div>
    </header>
  );
};