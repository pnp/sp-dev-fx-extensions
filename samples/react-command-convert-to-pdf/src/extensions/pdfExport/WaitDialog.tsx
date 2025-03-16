import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Dialog, DialogType, IDialogContentStyles } from '@fluentui/react/lib/Dialog';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { ProgressIndicator } from '@fluentui/react/lib/ProgressIndicator';
import { Icon } from '@fluentui/react/lib/Icon';
import { Log } from '@microsoft/sp-core-library';
import { ThemeProvider } from '@fluentui/react';
import styles from './WaitDialog.module.scss';
import * as strings from 'PdfExportCommandSetStrings';

enum NotificationType {
  Info,
  Success,
  Warning,
  Error
}

interface IWaitDialogState {
  isVisible: boolean;
  title: string;
  message: string;
  notificationType: NotificationType;
  showClose: boolean;
  progress?: {
    current: number;
    total: number;
  } | null;
}

type WaitDialogAction =
  | { type: 'SHOW_DIALOG'; title: string; message: string }
  | { type: 'SHOW_SUCCESS'; title: string; message: string }
  | { type: 'SHOW_WARNING'; title: string; message: string }
  | { type: 'SHOW_ERROR'; title: string; message: string }
  | { type: 'SET_PROGRESS'; current: number; total: number }
  | { type: 'CLOSE_DIALOG' };

const waitDialogReducer = (state: IWaitDialogState, action: WaitDialogAction): IWaitDialogState => {
  switch (action.type) {
    case 'SHOW_DIALOG':
      return { 
        ...state, 
        isVisible: true, 
        title: action.title, 
        message: action.message, 
        notificationType: NotificationType.Info,
        showClose: false,
        progress: null 
      };
    case 'SHOW_SUCCESS':
      return { 
        ...state, 
        isVisible: true, 
        title: action.title, 
        message: action.message, 
        notificationType: NotificationType.Success,
        showClose: true,
        progress: null 
      };
    case 'SHOW_WARNING':
      return { 
        ...state, 
        isVisible: true, 
        title: action.title, 
        message: action.message, 
        notificationType: NotificationType.Warning,
        showClose: true,
        progress: null 
      };
    case 'SHOW_ERROR':
      return { 
        ...state, 
        isVisible: true, 
        title: action.title, 
        message: action.message, 
        notificationType: NotificationType.Error,
        showClose: true,
        progress: null 
      };
    case 'SET_PROGRESS':
      return { 
        ...state, 
        progress: { current: action.current, total: action.total } 
      };
    case 'CLOSE_DIALOG':
      return { 
        ...state, 
        isVisible: false, 
        message: '', 
        title: '', 
        notificationType: NotificationType.Info,
        showClose: false,
        progress: null 
      };
    default:
      return state;
  }
};

interface IWaitDialogContentProps {
  message: string;
  title: string;
  notificationType: NotificationType;
  showClose: boolean;
  hidden: boolean;
  progress?: { current: number; total: number } | null;
  closeCallback: () => void;
}

// Notification icon component
const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
  let iconName: string;
  let iconColor: string;
  
  switch (type) {
    case NotificationType.Success:
      iconName = 'CheckMark';
      iconColor = 'green';
      break;
    case NotificationType.Warning:
      iconName = 'Warning';
      iconColor = 'orange';
      break;
    case NotificationType.Error:
      iconName = 'Error';
      iconColor = 'red';
      break;
    default:
      iconName = 'Info';
      iconColor = 'blue';
  }
  
  const iconStyles = { 
    marginRight: '8px', 
    color: iconColor,
    fontSize: '24px'
  };
  
  return <Icon iconName={iconName} style={iconStyles} />;
};

// Wait dialog content component
const WaitDialogContent: React.FC<IWaitDialogContentProps> = ({
  message,
  title,
  notificationType,
  showClose,
  hidden,
  progress,
  closeCallback
}) => {
  const dialogType = showClose ? DialogType.close : DialogType.normal;
  
  const progressPercentage = progress 
    ? progress.current / progress.total
    : undefined;

  // Dialog content styles
  const dialogContentStyles: Partial<IDialogContentStyles> = {
    title: {
      fontWeight: 600,
      fontSize: '20px',
      paddingBottom: 12,
      marginBottom: 0
    },
    subText: {
      fontSize: '14px'
    }
  };

  return (
    <div className={styles.dialogContainer}>
      <Dialog
        hidden={hidden}
        dialogContentProps={{ 
          type: dialogType, 
          title, 
          subText: message,
          styles: dialogContentStyles
        }}
        modalProps={{ 
          isDarkOverlay: true, 
          isBlocking: true, 
          onDismiss: closeCallback
        }}
        aria-live="assertive" 
        aria-label={title} 
        aria-describedby="dialog-message"
      >
        {notificationType !== NotificationType.Info && (
          <div className={styles.notificationIcon}>
            <NotificationIcon type={notificationType} />
          </div>
        )}
        
        {!showClose && !progress && (
          <Spinner 
            size={SpinnerSize.large} 
            label={strings.Processing}
            ariaLive="assertive"
            className={styles.spinner}
          />
        )}
        
        {progress && (
          <div className={styles.progressContainer}>
            <ProgressIndicator 
              label={`${strings.Processing} ${progress.current} of ${progress.total}`}
              percentComplete={progressPercentage}
              barHeight={4}
            />
          </div>
        )}
        
        <div className={styles.footer}>
          <div className={styles.pnpFooter}>
            <a 
              href="https://github.com/pnp/PnP" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Powered by PnP
            </a>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

// Create a DOM element for the portal
const dialogDiv = document.createElement('div');
document.body.appendChild(dialogDiv);

// Wait dialog component
const WaitDialog: React.FC<IWaitDialogState & { onClose: () => void }> = ({
  isVisible,
  message,
  title,
  notificationType,
  showClose,
  progress,
  onClose
}) => {
  return ReactDOM.createPortal(
    <ThemeProvider>
      <WaitDialogContent
        message={message}
        title={title}
        notificationType={notificationType}
        showClose={showClose}
        hidden={!isVisible}
        progress={progress}
        closeCallback={onClose}
      />
    </ThemeProvider>,
    dialogDiv
  );
};

// Wait dialog controller class
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
        notificationType: NotificationType.Info,
        showClose: false,
        progress: null
      });

      this.dispatch = dispatch;

      return (
        <WaitDialog
          {...state}
          onClose={() => dispatch({ type: 'CLOSE_DIALOG' })}
        />
      );
    };

    ReactDOM.render(<Wrapper />, this.container);
  }

  public show(title: string, message: string) {
    this.dispatch({ type: 'SHOW_DIALOG', title, message });
    Log.info('WaitDialogController', `Showing dialog: ${title} - ${message}`);
  }

  public showSuccess(title: string, message: string) {
    this.dispatch({ type: 'SHOW_SUCCESS', title, message });
    Log.info('WaitDialogController', `Showing success dialog: ${title} - ${message}`);
  }

  public showWarning(title: string, message: string) {
    this.dispatch({ type: 'SHOW_WARNING', title, message });
    Log.info('WaitDialogController', `Showing warning dialog: ${title} - ${message}`);
  }

  public showError(title: string, message: string) {
    this.dispatch({ type: 'SHOW_ERROR', title, message });
    Log.error('WaitDialogController', new Error(`Showing error dialog: ${title} - ${message}`));
  }

  public setProgress(current: number, total: number) {
    this.dispatch({ type: 'SET_PROGRESS', current, total });
    Log.verbose('WaitDialogController', `Progress updated: ${current}/${total}`);
  }

  public close() {
    this.dispatch({ type: 'CLOSE_DIALOG' });
    Log.info('WaitDialogController', 'Closing dialog.');
  }

  // Helper method to update progress during batch operations
  public updateBatchProgress(current: number, total: number, currentItemName?: string) {
    this.setProgress(current, total);
    
    if (currentItemName) {
      this.dispatch({ 
        type: 'SHOW_DIALOG', 
        title: `${strings.Processing} ${current} of ${total}`, 
        message: `${strings.ConvertingToPdf.replace('{0}', currentItemName)}` 
      });
    }
  }
}

export default new WaitDialogController();