import React, { createContext, useEffect, useState, type ReactNode } from 'react';
import { type Socket } from 'socket.io-client';
import { socketService } from '../services/socket';
import { useAuth } from '../hooks/useAuth';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = socketService.connect();
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      return () => {
        newSocket.off('connect');
        newSocket.off('disconnect');
        newSocket.off('connect_error');
        socketService.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      socketService.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [user]);

  const value: SocketContextType = {
    socket,
    isConnected
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext };