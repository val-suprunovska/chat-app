import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  sidebarWidth: number;
  isResizing: boolean;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  startResizing: () => void;
  stopResizing: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320); // Начальная ширина
  const [isResizing, setIsResizing] = useState(false);

  // Автоматическое определение начального состояния на основе ширины экрана
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // На мобильных устройствах сворачиваем панель
        setIsCollapsed(true);
        setSidebarWidth(60);
      } else if (window.innerWidth < 1024) {
        // На планшетах устанавливаем среднюю ширину
        setIsCollapsed(false);
        setSidebarWidth(280);
      } else {
        // На десктопах полная ширина
        setIsCollapsed(false);
        setSidebarWidth(320);
      }
    };

    // Устанавливаем начальное состояние
    handleResize();

    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const startResizing = () => {
    setIsResizing(true);
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const value: SidebarContextType = {
    isCollapsed,
    sidebarWidth,
    isResizing,
    toggleSidebar,
    setSidebarWidth,
    startResizing,
    stopResizing
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};