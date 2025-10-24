import React, { useCallback, useEffect } from 'react';
import { useSidebar } from '../../../contexts/SidebarContext';
import './SidebarResizer.css';

export const SidebarResizer: React.FC = () => {
  const { 
    setSidebarWidth, 
    isResizing, 
    startResizing, 
    stopResizing 
  } = useSidebar(); // Убрали sidebarWidth так как он не используется

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startResizing();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    // Ограничиваем минимальную и максимальную ширину
    const newWidth = Math.max(200, Math.min(e.clientX, 500));
    setSidebarWidth(newWidth);
  }, [isResizing, setSidebarWidth]);

  const handleMouseUp = useCallback(() => {
    stopResizing();
  }, [stopResizing]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Блокируем выделение текста при изменении размера
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Восстанавливаем выделение текста
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      className={`sidebar-resizer ${isResizing ? 'resizing' : ''}`}
      onMouseDown={handleMouseDown}
    />
  );
};