import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { SidebarProvider } from './contexts/SidebarContext';
import './App.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <SidebarProvider>
          <App />
        </SidebarProvider>
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);