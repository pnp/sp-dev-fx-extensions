import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { 
  Dialog, 
  DialogType, 
  DialogFooter 
} from '@fluentui/react/lib/Dialog';
import { 
  PrimaryButton, 
  DefaultButton 
} from '@fluentui/react/lib/Button';
import { 
  MessageBar, 
  MessageBarType 
} from '@fluentui/react/lib/MessageBar';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';

export interface IBaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subText?: string;
  children: React.ReactNode;
  
  // Footer configuration
  primaryButton?: {
    text: string;
    onClick: () => void | Promise<void>;
    disabled?: boolean;
    iconProps?: { iconName: string };
  };
  secondaryButton?: {
    text: string;
    onClick: () => void;
    disabled?: boolean;
    iconProps?: { iconName: string };
  };
  
  // Dialog configuration
  dialogType?: DialogType;
  isBlocking?: boolean;
  maxWidth?: number | string;
  width?: string;
  
  // State management
  isLoading?: boolean;
  error?: string | null;
  showErrorDismiss?: boolean;
  
  // Styling
  className?: string;
  contentClassName?: string;
}

export const BaseDialog: React.FC<IBaseDialogProps> = ({
  isOpen,
  onClose,
  title,
  subText,
  children,
  primaryButton,
  secondaryButton,
  dialogType = DialogType.normal,
  isBlocking = true,
  maxWidth = 600,
  width = '90vw',
  isLoading = false,
  error = null,
  showErrorDismiss = true,
  className = '',
  contentClassName = ''
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  // Clear internal error when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setInternalError(null);
      setInternalLoading(false);
    }
  }, [isOpen]);

  const handlePrimaryClick = useCallback(async () => {
    if (!primaryButton?.onClick) return;

    try {
      setInternalLoading(true);
      setInternalError(null);
      
      const result = primaryButton.onClick();
      if (result instanceof Promise) {
        await result;
      }
    } catch (err) {
      setInternalError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setInternalLoading(false);
    }
  }, [primaryButton]);

  const handleSecondaryClick = useCallback(() => {
    if (secondaryButton?.onClick) {
      secondaryButton.onClick();
    } else {
      onClose();
    }
  }, [secondaryButton, onClose]);

  const displayError = error || internalError;
  const displayLoading = isLoading || internalLoading;

  return (
    <Dialog
      hidden={!isOpen}
      onDismiss={onClose}
      dialogContentProps={{
        type: dialogType,
        title: title,
        subText: subText
      }}
      modalProps={{
        isBlocking: isBlocking,
        styles: { 
          main: { 
            maxWidth: maxWidth, 
            width: width,
            selectors: {
              ['@media (min-width: 768px)']: {
                width: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth
              }
            }
          } 
        },
        className: className
      }}
    >
      <div className={contentClassName}>
        {/* Error Display */}
        {displayError && (
          <MessageBar
            messageBarType={MessageBarType.error}
            onDismiss={showErrorDismiss ? () => setInternalError(null) : undefined}
            styles={{ root: { marginBottom: '16px' } }}
          >
            {displayError}
          </MessageBar>
        )}

        {/* Loading Overlay */}
        {displayLoading && (
          <div style={{
            position: 'relative',
            minHeight: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1000
          }}>
            <Spinner size={SpinnerSize.large} label="Loading..." />
          </div>
        )}

        {/* Main Content - hidden when loading */}
        <div style={{ display: displayLoading ? 'none' : 'block' }}>
          {children}
        </div>
      </div>

      {/* Footer */}
      {(primaryButton || secondaryButton) && (
        <DialogFooter>
          {primaryButton && (
            <PrimaryButton
              text={primaryButton.text}
              onClick={handlePrimaryClick}
              disabled={primaryButton.disabled || displayLoading}
              iconProps={primaryButton.iconProps}
            />
          )}
          {secondaryButton && (
            <DefaultButton
              text={secondaryButton.text}
              onClick={handleSecondaryClick}
              disabled={secondaryButton.disabled || displayLoading}
              iconProps={secondaryButton.iconProps}
            />
          )}
          {!secondaryButton && (
            <DefaultButton
              text="Cancel"
              onClick={onClose}
              disabled={displayLoading}
            />
          )}
        </DialogFooter>
      )}
    </Dialog>
  );
};

// Hook for dialog state management
export const useDialogState = (initialOpen: boolean = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openDialog = useCallback(() => {
    setIsOpen(true);
    setError(null);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setError(null);
    setIsLoading(false);
  }, []);

  const setLoadingState = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const setErrorState = useCallback((error: string | null) => {
    setError(error);
    setIsLoading(false);
  }, []);

  return {
    isOpen,
    isLoading,
    error,
    openDialog,
    closeDialog,
    setLoadingState,
    setErrorState
  };
};