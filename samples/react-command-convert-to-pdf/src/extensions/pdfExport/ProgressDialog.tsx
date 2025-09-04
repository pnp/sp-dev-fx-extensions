import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Dialog, DialogType } from '@fluentui/react/lib/Dialog';
import { ProgressIndicator } from '@fluentui/react/lib/ProgressIndicator';
import { Icon } from '@fluentui/react/lib/Icon';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { useTheme, mergeStyles } from '@fluentui/react';
import { Log } from '@microsoft/sp-core-library';
import * as strings from 'PdfExportCommandSetStrings';
import styles from './ProgressDialog.module.scss';

interface IProgressDialogState {
  isVisible: boolean;
  title: string;
  message: string;
  current: number;
  total: number;
  currentFileName: string;
  status: 'processing' | 'completed' | 'error';
}

type ProgressDialogAction =
  | { type: 'SHOW_DIALOG'; title: string; message: string; total: number }
  | { type: 'UPDATE_PROGRESS'; current: number; total: number; fileName: string; status: 'processing' | 'completed' | 'error' }
  | { type: 'CLOSE_DIALOG' };

const progressDialogReducer = (state: IProgressDialogState, action: ProgressDialogAction): IProgressDialogState => {
  switch (action.type) {
    case 'SHOW_DIALOG':
      return {
        ...state,
        isVisible: true,
        title: action.title,
        message: action.message,
        total: action.total,
        current: 0,
        currentFileName: '',
        status: 'processing'
      };
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        current: action.current,
        total: action.total,
        currentFileName: action.fileName,
        status: action.status
      };
    case 'CLOSE_DIALOG':
      return {
        ...state,
        isVisible: false,
        current: 0,
        total: 0,
        currentFileName: '',
        status: 'processing'
      };
    default:
      return state;
  }
};

interface IProgressDialogContentProps {
  title: string;
  message: string;
  current: number;
  total: number;
  currentFileName: string;
  status: 'processing' | 'completed' | 'error';
  hidden: boolean;
}

const StatusIcon: React.FC<{ status: 'processing' | 'completed' | 'error' }> = ({ status }) => {
  const theme = useTheme();
  
  const iconStyle = {
    fontSize: '16px',
    marginRight: '8px'
  };
  
  switch (status) {
    case 'completed':
      return <Icon iconName="CheckMark" style={{ ...iconStyle, color: theme.palette.green }} />;
    case 'error':
      return <Icon iconName="ErrorBadge" style={{ ...iconStyle, color: theme.palette.redDark }} />;
    default:
      return <Icon iconName="Processing" style={{ ...iconStyle, color: theme.palette.themePrimary }} />;
  }
};

const ProgressDialogContent: React.FC<IProgressDialogContentProps> = ({
  title,
  message,
  current,
  total,
  currentFileName,
  status,
  hidden
}) => {
  const theme = useTheme();
  const progressPercentage = total > 0 ? (current / total) : 0;
  const progressText = `${current} ${strings.Of} ${total} ${strings.FilesProcessed}`;

  const dialogStyles = mergeStyles({
    selectors: {
      '.ms-Dialog-main': {
        backgroundColor: theme.palette.white,
        borderRadius: '12px',
        boxShadow: theme.effects.elevation16,
        border: `1px solid ${theme.palette.neutralLight}`,
        minWidth: '500px',
        maxWidth: '700px',
        overflow: 'hidden'
      },
      '.ms-Dialog-title': {
        fontSize: theme.fonts.xLarge.fontSize,
        fontWeight: '600',
        color: theme.palette.neutralPrimary,
        padding: '24px 24px 16px 24px',
        margin: '0',
        borderBottom: `1px solid ${theme.palette.neutralLighter}`
      },
      '.ms-Dialog-content': {
        padding: '0'
      }
    }
  });

  return (
    <div className={`${styles['progress-dialog-container']} ${dialogStyles}`}>
      <Dialog
        hidden={hidden}
        dialogContentProps={{ 
          type: DialogType.normal, 
          title: title,
          showCloseButton: false,
          className: undefined
        }}
        modalProps={{ 
          isDarkOverlay: true, 
          isBlocking: true,
          dragOptions: undefined,
          className: undefined
        }}
        minWidth={500}
        maxWidth={700}
      >
        <div className={styles['progress-body']}>
          {/* Progress Header */}
          <div className={styles['progress-header']}>
            <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
              <div className={styles['progress-icon-container']}>
                <Icon iconName="CloudDownload" className={styles['progress-header-icon']} />
              </div>
              <div className={styles['progress-header-content']}>
                <Text variant="large" className={styles['progress-header-title']}>
                  {message}
                </Text>
                <Text variant="medium" className={styles['progress-header-subtitle']}>
                  Converting documents to PDF format
                </Text>
              </div>
            </Stack>
          </div>

          {/* Main Progress Section */}
          <div className={styles['progress-main']}>
            <ProgressIndicator
              label={progressText}
              description={`${Math.round(progressPercentage * 100)}% complete`}
              percentComplete={progressPercentage}
              className={styles['main-progress-indicator']}
            />
            
            {/* Current File Status */}
            {currentFileName && (
              <div className={styles['current-file-section']}>
                <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign="center">
                  <StatusIcon status={status} />
                  <div className={styles['current-file-info']}>
                    <Text variant="mediumPlus" className={styles['current-file-label']}>
                      {status === 'processing' && strings.Processing}
                      {status === 'completed' && strings.Completed}
                      {status === 'error' && strings.Error}
                    </Text>
                    <Text variant="small" className={styles['current-file-name']}>
                      {currentFileName}
                    </Text>
                  </div>
                </Stack>
              </div>
            )}

            {/* Status Message */}
            {status === 'error' && currentFileName && (
              <MessageBar
                messageBarType={MessageBarType.warning}
                className={styles['status-message']}
              >
                <Text variant="small">
                  Some files could not be converted. The process will continue with remaining files.
                </Text>
              </MessageBar>
            )}
          </div>

          {/* Branding Footer */}
          <div className={styles['progress-footer']}>
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

class ProgressDialogController {
  private container: HTMLElement;
  private dispatch!: React.Dispatch<ProgressDialogAction>;

  constructor() {
    this.container = document.createElement('div');
    document.body.appendChild(this.container);

    const Wrapper: React.FC = () => {
      const [state, dispatch] = React.useReducer(progressDialogReducer, {
        isVisible: false,
        title: '',
        message: '',
        current: 0,
        total: 0,
        currentFileName: '',
        status: 'processing'
      });

      this.dispatch = dispatch;

      return (
        <ProgressDialogContent
          title={state.title}
          message={state.message}
          current={state.current}
          total={state.total}
          currentFileName={state.currentFileName}
          status={state.status}
          hidden={!state.isVisible}
        />
      );
    };

    ReactDOM.render(<Wrapper />, this.container);
  }

  public show(title: string, message: string, total: number): void {
    this.dispatch({ type: 'SHOW_DIALOG', title, message, total });
    Log.info('ProgressDialogController', `Showing progress dialog: ${title} - ${message} (Total: ${total})`);
  }

  public updateProgress(current: number, total: number, fileName: string, status: 'processing' | 'completed' | 'error'): void {
    this.dispatch({ type: 'UPDATE_PROGRESS', current, total, fileName, status });
    Log.info('ProgressDialogController', `Progress update: ${current}/${total} - ${fileName} - ${status}`);
  }

  public close(): void {
    this.dispatch({ type: 'CLOSE_DIALOG' });
    Log.info('ProgressDialogController', 'Closing progress dialog');
  }
}

export default new ProgressDialogController();