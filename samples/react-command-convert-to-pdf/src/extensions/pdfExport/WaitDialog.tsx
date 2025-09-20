import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Dialog, DialogType } from '@fluentui/react/lib/Dialog';
import { Icon } from '@fluentui/react/lib/Icon';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { ProgressIndicator } from '@fluentui/react/lib/ProgressIndicator';
import { Log } from '@microsoft/sp-core-library';
import { mergeStyles } from '@fluentui/react';
import styles from './WaitDialog.module.scss';

interface IWaitDialogState {
  isVisible: boolean;
  title: string;
  message: string;
  error: string;
  showClose: boolean;
  progress?: number;
  currentFile?: string;
  estimatedTime?: string;
}

type WaitDialogAction =
  | { type: 'SHOW_DIALOG'; title: string; message: string }
  | { type: 'SHOW_ERROR'; title: string; message: string }
  | { type: 'UPDATE_PROGRESS'; progress?: number; currentFile?: string; estimatedTime?: string }
  | { type: 'CLOSE_DIALOG' };

const waitDialogReducer = (state: IWaitDialogState, action: WaitDialogAction): IWaitDialogState => {
  switch (action.type) {
    case 'SHOW_DIALOG':
      return { 
        ...state, 
        isVisible: true, 
        title: action.title, 
        message: action.message, 
        error: '', 
        showClose: false,
        progress: undefined,
        currentFile: undefined,
        estimatedTime: undefined
      };
    case 'SHOW_ERROR':
      return { 
        ...state, 
        isVisible: true, 
        title: action.title, 
        message: action.message, 
        error: action.message, 
        showClose: true,
        progress: undefined,
        currentFile: undefined,
        estimatedTime: undefined
      };
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        progress: action.progress,
        currentFile: action.currentFile,
        estimatedTime: action.estimatedTime
      };
    case 'CLOSE_DIALOG':
      return { 
        ...state, 
        isVisible: false, 
        message: '', 
        title: '', 
        error: '', 
        showClose: false,
        progress: undefined,
        currentFile: undefined,
        estimatedTime: undefined
      };
    default:
      return state;
  }
};

interface IWaitDialogContentProps {
  message: string;
  error: string;
  title: string;
  showClose: boolean;
  hidden: boolean;
  progress?: number;
  currentFile?: string;
  estimatedTime?: string;
  closeCallback: () => void;
}

const ErrorContent: React.FC<{ error: string }> = ({ error }) => {
  return error ? (
    <div className={styles['error-container']}>
      <MessageBar 
        messageBarType={MessageBarType.error} 
        className={styles['error-message']}
      >
        <Stack tokens={{ childrenGap: 12 }}>
          <Stack horizontal tokens={{ childrenGap: 12 }} verticalAlign="center">
            <Icon iconName="ErrorBadge" className={styles['error-icon']} />
            <Text variant="large" className={styles['error-title']}>
              Operation Failed
            </Text>
          </Stack>
          <Text variant="medium" className={styles['error-text']}>
            {error}
          </Text>
        </Stack>
      </MessageBar>
    </div>
  ) : null;
};

const LoadingContent: React.FC<{ 
  message: string; 
  title: string; 
  progress?: number; 
  currentFile?: string; 
  estimatedTime?: string; 
}> = ({ message, title, progress, currentFile, estimatedTime }) => {
  return (
    <div className={styles['loading-container']}>
      <div className={styles['loading-content']}>
        <div className={styles['loading-header']}>
          <div className={styles['icon-container']}>
            <div className={styles['icon-background']}>
              <Icon iconName="PDF" className={styles['main-icon']} />
            </div>
          </div>
          <div className={styles['header-content']}>
            <div className={styles['main-title']}>
              {title}
            </div>
            <div className={styles['main-subtitle']}>
              <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign="center" horizontalAlign="center">
                <Spinner size={SpinnerSize.small} />
                <Text>{message}</Text>
              </Stack>
            </div>
            {estimatedTime && (
              <div className={styles['estimated-time']}>
                {estimatedTime}
              </div>
            )}
          </div>
        </div>

        <div className={styles['progress-section']}>
          {progress !== undefined ? (
            <ProgressIndicator
              percentComplete={progress / 100}
              description={`${Math.round(progress)}% complete`}
              className={styles['main-progress']}
            />
          ) : (
            <ProgressIndicator
              description="Processing your request..."
              className={styles['main-progress']}
            />
          )}
        </div>

        {currentFile && (
          <div className={styles['current-file-section']}>
            <div className={styles['current-file-label']}>
              Currently processing:
            </div>
            <div className={styles['file-info-card']}>
              <Icon iconName="Document" className={styles['file-icon']} />
              <div className={styles['file-details']}>
                <div className={styles['file-name']}>
                  {currentFile}
                </div>
                <div className={styles['file-status']}>
                  Converting to PDF...
                </div>
              </div>
              <div className={styles['processing-indicator']}>
                <Spinner size={SpinnerSize.small} />
              </div>
            </div>
          </div>
        )}

        <div className={styles['status-info']}>
          <div className={styles['status-items']}>
            <div className={styles['status-item']}>
              <Icon iconName="CheckMark" className={styles['status-icon-success']} />
              <span className={styles['status-text']}>Secure</span>
            </div>
            <div className={styles['status-item']}>
              <Icon iconName="Shield" className={styles['status-icon-success']} />
              <span className={styles['status-text']}>Microsoft Graph</span>
            </div>
            <div className={styles['status-item']}>
              <Icon iconName="Cloud" className={styles['status-icon-success']} />
              <span className={styles['status-text']}>Cloud</span>
            </div>
          </div>
        </div>

        <div className={styles['tips-section']}>
          <div className={styles['tip-title']}>
            💡 Tip
          </div>
          <div className={styles['tip-text']}>
            Select multiple files for batch conversion
          </div>
        </div>
      </div>
    </div>
  );
};

const WaitDialogContent: React.FC<IWaitDialogContentProps> = ({
  message,
  error,
  title,
  showClose,
  hidden,
  progress,
  currentFile,
  estimatedTime,
  closeCallback,
}) => {
  const dialogType = showClose ? DialogType.close : DialogType.normal;
  
  const dialogStyles = mergeStyles({
    selectors: {
      '.ms-Dialog-main': {
        backgroundColor: '#ffffff',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e1e1e1',
        minWidth: '480px',
        maxWidth: '520px',
        overflow: 'hidden'
      },
      '.ms-Dialog-title': {
        display: 'none'
      },
      '.ms-Dialog-content': {
        padding: '0'
      }
    }
  });

  return (
    <div className={`${styles['dialog-container']} ${dialogStyles}`}>
      <Dialog
        hidden={hidden}
        dialogContentProps={{ 
          type: dialogType,
          showCloseButton: showClose,
          className: undefined
        }}
        modalProps={{ 
          isDarkOverlay: true, 
          isBlocking: !showClose,
          onDismiss: showClose ? closeCallback : undefined,
          className: undefined
        }}
        minWidth={480}
        maxWidth={600}
      >
        <div className={styles['dialog-body']}>
          {error ? (
            <ErrorContent error={error} />
          ) : (
            <LoadingContent 
              message={message} 
              title={title} 
              progress={progress}
              currentFile={currentFile}
              estimatedTime={estimatedTime}
            />
          )}
          
          {showClose && (
            <div className={styles['dialog-actions']}>
              <DefaultButton 
                text="Close" 
                onClick={closeCallback}
                className={styles['close-button']}
                iconProps={{ iconName: 'Cancel' }}
              />
            </div>
          )}
          
          <div className={styles['branding-footer']}>
            <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign="center" horizontalAlign="center">
              <Icon iconName="SharePointLogo" className={styles['branding-icon']} />
              <Text variant="small" className={styles['branding-text']}>
                Powered by <strong>PnP Community</strong>
              </Text>
            </Stack>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

const dialogDiv = document.createElement('div');
document.body.appendChild(dialogDiv);

const WaitDialog: React.FC<IWaitDialogState & { onClose: () => void }> = ({
  isVisible,
  message,
  title,
  error,
  showClose,
  progress,
  currentFile,
  estimatedTime,
  onClose,
}) => {
  return ReactDOM.createPortal(
    <WaitDialogContent
      message={message}
      title={title}
      error={error}
      showClose={showClose}
      progress={progress}
      currentFile={currentFile}
      estimatedTime={estimatedTime}
      hidden={!isVisible}
      closeCallback={onClose}
    />,
    dialogDiv
  );
};

class WaitDialogController {
  private container: HTMLElement;
  private dispatch!: React.Dispatch<WaitDialogAction>;

  constructor() {
    this.container = document.createElement('div');
    document.body.appendChild(this.container);

    const Wrapper: React.FC = () => {
      const [state, dispatch] = React.useReducer(waitDialogReducer, {
        isVisible: false,
        message: '',
        title: '',
        error: '',
        showClose: false,
      });

      this.dispatch = dispatch;

      return <WaitDialog {...state} onClose={() => dispatch({ type: 'CLOSE_DIALOG' })} />;
    };

    ReactDOM.render(<Wrapper />, this.container);
  }

  public show(title: string, message: string) {
    this.dispatch({ type: 'SHOW_DIALOG', title, message });
    Log.info('WaitDialogController', `Showing dialog: ${title} - ${message}`);
  }

  public showError(title: string, message: string) {
    this.dispatch({ type: 'SHOW_ERROR', title, message });
    Log.error('WaitDialogController', new Error(`Showing error dialog: ${title} - ${message}`));
  }

  public updateProgress(progress?: number, currentFile?: string, estimatedTime?: string) {
    this.dispatch({ type: 'UPDATE_PROGRESS', progress, currentFile, estimatedTime });
    Log.info('WaitDialogController', `Updating progress: ${progress}% - ${currentFile}`);
  }

  public close() {
    this.dispatch({ type: 'CLOSE_DIALOG' });
    Log.info('WaitDialogController', 'Closing dialog.');
  }
}

export default new WaitDialogController();