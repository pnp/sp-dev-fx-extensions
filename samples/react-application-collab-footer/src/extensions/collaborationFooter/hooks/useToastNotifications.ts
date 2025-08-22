import { useState, useCallback } from 'react';
import { IToastMessage } from '../components/shared/ToastNotification';

export interface IUseToastNotifications {
  messages: IToastMessage[];
  showToast: (message: Omit<IToastMessage, 'id'>) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
}

export const useToastNotifications = (): IUseToastNotifications => {
  const [messages, setMessages] = useState<IToastMessage[]>([]);

  const showToast = useCallback((message: Omit<IToastMessage, 'id'>) => {
    const newMessage: IToastMessage = {
      ...message,
      id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      duration: message.duration || 5000 // Default 5 seconds
    };

    setMessages(prev => [...prev, newMessage]);
  }, []);

  const showSuccess = useCallback((message: string, duration: number = 4000) => {
    showToast({
      message,
      type: 'success',
      duration
    });
  }, [showToast]);

  const showError = useCallback((message: string, duration: number = 6000) => {
    showToast({
      message,
      type: 'error',
      duration
    });
  }, [showToast]);

  const showWarning = useCallback((message: string, duration: number = 5000) => {
    showToast({
      message,
      type: 'warning',
      duration
    });
  }, [showToast]);

  const showInfo = useCallback((message: string, duration: number = 4000) => {
    showToast({
      message,
      type: 'info',
      duration
    });
  }, [showToast]);

  const dismissToast = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismissToast,
    clearAllToasts
  };
};