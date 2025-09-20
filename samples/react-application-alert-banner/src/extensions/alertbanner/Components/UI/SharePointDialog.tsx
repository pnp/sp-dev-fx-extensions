import * as React from "react";
import styles from "./SharePointDialog.module.scss";
import { Dismiss24Regular } from "@fluentui/react-icons";

export interface ISharePointDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  width?: number;
  height?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const SharePointDialog: React.FC<ISharePointDialogProps> = ({
  isOpen,
  onClose,
  title,
  width = 800,
  height,
  children,
  footer,
  className
}) => {
  const dialogRef = React.useRef<HTMLDivElement>(null);

  // Handle click outside to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Focus management
  React.useEffect(() => {
    if (isOpen && dialogRef.current) {
      const focusableElement = dialogRef.current.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
      if (focusableElement) {
        focusableElement.focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const dialogStyle: React.CSSProperties = {
    width,
    ...(height && { height, maxHeight: height }),
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div 
        className={`${styles.dialog} ${className || ''}`} 
        style={dialogStyle}
        ref={dialogRef}
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="dialog-title"
      >
        <div className={styles.header}>
          <h2 id="dialog-title" className={styles.title}>
            {title}
          </h2>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            <Dismiss24Regular />
          </button>
        </div>
        
        <div className={styles.content}>
          {children}
        </div>
        
        {footer && (
          <div className={styles.footer}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharePointDialog;