import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Label, ILabelStyles } from '@fluentui/react/lib/Label';
import { Dialog, DialogType } from '@fluentui/react/lib/Dialog';
import { Log } from '@microsoft/sp-core-library';
import { useTheme } from '@fluentui/react'; // Fluent UI theme
import styles from './WaitDialog.module.scss';

interface IWaitDialogState {
  isVisible: boolean;
  title: string;
  message: string;
  error: string;
  showClose: boolean;
}

type WaitDialogAction =
  | { type: 'SHOW_DIALOG'; title: string; message: string }
  | { type: 'SHOW_ERROR'; title: string; message: string }
  | { type: 'CLOSE_DIALOG' };

const waitDialogReducer = (state: IWaitDialogState, action: WaitDialogAction): IWaitDialogState => {
  switch (action.type) {
    case 'SHOW_DIALOG':
      return { ...state, isVisible: true, title: action.title, message: action.message, error: '', showClose: false };
    case 'SHOW_ERROR':
      return { ...state, isVisible: true, title: action.title, message: action.message, error: action.message, showClose: true };
    case 'CLOSE_DIALOG':
      return { ...state, isVisible: false, message: '', title: '', error: '', showClose: false };
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
  closeCallback: () => void;
}

const ErrorLabel: React.FC<{ error: string }> = ({ error }) => {
  const theme = useTheme();
  const labelStyles: ILabelStyles = {
    root: {
      marginBottom: '10px',
      color: theme.palette.redDark,
    },
  };
  return error ? <Label styles={labelStyles}><span dangerouslySetInnerHTML={{ __html: error }} /></Label> : null;
};

const WaitDialogContent: React.FC<IWaitDialogContentProps> = ({
  message,
  error,
  title,
  showClose,
  hidden,
  closeCallback,
}) => {
  const dialogType = showClose ? DialogType.close : DialogType.normal;

  return (
    <div className={styles.dialogContainer}>
      <Dialog
        hidden={hidden}
        dialogContentProps={{ type: dialogType, title, subText: message }}
        modalProps={{ isDarkOverlay: true, isBlocking: true, onDismiss: closeCallback }}
        aria-live="assertive" aria-label={title} aria-describedby="dialog-message"
      >
        <ErrorLabel error={error} />
        <div className={styles.pnpFooter}>
          <a href="https://github.com/pnp/PnP" target="_blank" rel="noopener noreferrer">
            Powered by PnP
          </a>
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
  onClose,
}) => {
  return ReactDOM.createPortal(
    <WaitDialogContent
      message={message}
      title={title}
      error={error}
      showClose={showClose}
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

  public close() {
    this.dispatch({ type: 'CLOSE_DIALOG' });
    Log.info('WaitDialogController', 'Closing dialog.');
  }
}

export default new WaitDialogController();
