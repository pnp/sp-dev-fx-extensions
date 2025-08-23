import * as React from 'react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import styles from './ToastNotification.module.scss';

export interface IToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  actions?: IToastAction[];
}

export interface IToastAction {
  text: string;
  action: () => void;
}

export interface IToastNotificationProps {
  message: IToastMessage;
  onDismiss: (id: string) => void;
}

export interface IToastContainerProps {
  messages: IToastMessage[];
  onDismiss: (id: string) => void;
}

const ToastNotification: React.FC<IToastNotificationProps> = ({ message, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);
  const dismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const getMessageBarType = (type: string): MessageBarType => {
    switch (type) {
      case 'success': return MessageBarType.success;
      case 'error': return MessageBarType.error;
      case 'warning': return MessageBarType.warning;
      case 'info': 
      default: return MessageBarType.info;
    }
  };


  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    // Clear any existing timeout
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
    }
    // Delay actual removal to allow exit animation
    dismissTimeoutRef.current = setTimeout(() => {
      onDismiss(message.id);
      dismissTimeoutRef.current = null;
    }, 300);
  }, [message.id, onDismiss]);

  useEffect(() => {
    if (message.duration && message.duration > 0) {
      const timer = setTimeout(handleDismiss, message.duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [message.duration, handleDismiss]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
        dismissTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`${styles.toast} ${isVisible ? styles.toastVisible : styles.toastHidden}`}>
      <MessageBar
        messageBarType={getMessageBarType(message.type)}
        onDismiss={handleDismiss}
        dismissButtonAriaLabel="Close notification"
        isMultiline={true}
        styles={{
          root: {
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            border: 'none',
            marginBottom: '8px',
            minWidth: '320px',
            maxWidth: '480px'
          },
          content: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          },
          iconContainer: {
            marginRight: '8px'
          }
        }}
      >
        <div className={styles.toastContent}>
          <div className={styles.toastMessage}>
            {message.message}
          </div>
          
          {message.actions && message.actions.length > 0 && (
            <div className={styles.toastActions}>
              {message.actions.map((action, index) => (
                <button
                  key={index}
                  className={styles.toastActionButton}
                  onClick={() => {
                    action.action();
                    handleDismiss();
                  }}
                >
                  {action.text}
                </button>
              ))}
            </div>
          )}
        </div>
      </MessageBar>
    </div>
  );
};

export const ToastContainer: React.FC<IToastContainerProps> = ({ messages, onDismiss }) => {
  if (messages.length === 0) return null;

  return (
    <div className={styles.toastContainer} role="alert" aria-live="polite">
      {messages.map(message => (
        <ToastNotification
          key={message.id}
          message={message}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};

export default ToastNotification;