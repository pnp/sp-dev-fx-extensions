import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  Dialog,
  DialogType,
  DialogFooter,
  IDialogContentProps
} from '@fluentui/react/lib/Dialog';
import { Checkbox } from '@fluentui/react/lib/Checkbox';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { IStackTokens, Stack } from '@fluentui/react/lib/Stack';
import { TextField } from '@fluentui/react/lib/TextField';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { IconButton, TooltipHost, DirectionalHint, Label } from '@fluentui/react';
import { Log } from '@microsoft/sp-core-library';
import * as strings from 'PdfExportCommandSetStrings';
import styles from './PdfOptionsDialog.module.scss';
import { RichText } from "@pnp/spfx-controls-react/lib/RichText";

// Interface for PDF options
export interface IPdfOptions {
  preserveMetadata: boolean;
  emailAfterConversion: boolean;
  emailRecipients?: string;
  emailSubject?: string;
  emailBody?: string;
  emailBodyFormat: 'text' | 'html';
  useCustomFilename: boolean;
  filenamePattern?: string;
}

// Include isVisible to control the Dialog's hidden prop
interface IPdfOptionsDialogProps {
  options: IPdfOptions;
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (options: IPdfOptions) => void;
}

// Interface for component state in the controller
interface IPdfOptionsDialogState {
  isVisible: boolean;
  options: IPdfOptions;
  onConfirm: (options: IPdfOptions) => void;
  validationErrors: {
    email: string | null;
    filename: string | null;
  };
}

// Action types for reducer
type PdfOptionsDialogAction =
  | { type: 'SHOW_DIALOG'; options: IPdfOptions; onConfirm: (options: IPdfOptions) => void }
  | { type: 'UPDATE_OPTIONS'; newOptions: Partial<IPdfOptions> }
  | { type: 'SET_VALIDATION_ERROR'; field: 'email' | 'filename'; error: string | null }
  | { type: 'CLOSE_DIALOG' };

// Reducer to manage dialog state
const pdfOptionsDialogReducer = (
  state: IPdfOptionsDialogState,
  action: PdfOptionsDialogAction
): IPdfOptionsDialogState => {
  switch (action.type) {
    case 'SHOW_DIALOG':
      return {
        ...state,
        isVisible: true,
        options: {
          ...action.options,
          emailBodyFormat: 'html'
        },
        onConfirm: action.onConfirm,
        validationErrors: { email: null, filename: null }
      };
    case 'UPDATE_OPTIONS':
      return {
        ...state,
        options: { ...state.options, ...action.newOptions }
      };
    case 'SET_VALIDATION_ERROR':
      return {
        ...state,
        validationErrors: {
          ...state.validationErrors,
          [action.field]: action.error
        }
      };
    case 'CLOSE_DIALOG':
      return {
        ...state,
        isVisible: false
      };
    default:
      return state;
  }
};

// Email and filename validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
};

const validateEmails = (emails: string): boolean => {
  if (!emails || emails.trim() === '') return true;
  const emailList = emails.split(';').map(e => e.trim()).filter(e => e !== '');
  return emailList.every(email => validateEmail(email));
};

const validateFilenamePattern = (pattern: string): boolean => {
  // Check for characters that are illegal in Windows filenames.
  const illegalChars = /[<>:"\/\\|?*]/;
  // Ignore tokens in the pattern.
  return !illegalChars.test(pattern.replace(/\{[^}]+\}/g, ''));
};

// PDF Options Dialog Content Component
const PdfOptionsDialogContent: React.FC<IPdfOptionsDialogProps> = ({
  options,
  isVisible,
  onClose,
  onConfirm
}) => {
  // Local state for options (always force HTML format)
  const [localOptions, setLocalOptions] = React.useState<IPdfOptions>({
    ...options,
    emailAfterConversion: options.emailAfterConversion || true,
    useCustomFilename: options.useCustomFilename || false,
    filenamePattern: options.filenamePattern || '{filename}',
    emailBodyFormat: 'html'
  });

  const [validationErrors, setValidationErrors] = React.useState<{
    email: string | null;
    filename: string | null;
  }>({ email: null, filename: null });

  // Update local options when props change
  React.useEffect(() => {
    setLocalOptions({
      ...options,
      emailAfterConversion: options.emailAfterConversion || true,
      useCustomFilename: options.useCustomFilename || false,
      filenamePattern: options.filenamePattern || '{filename}',
      emailBodyFormat: 'html'
    });
  }, [options, isVisible]);

  const dialogContentProps: IDialogContentProps = {
    type: DialogType.normal,
    title: strings.EmailPdfTitle || "Send PDF as Email",
    subText: strings.EmailPdfSubtext || "Configure PDF email options",
    closeButtonAriaLabel: 'Close'
  };

  const dialogModalProps = {
    isBlocking: true,
    styles: {
      main: { maxWidth: 700 },
      layer: { zIndex: 1000 }
    },
    // Important: This ensures the close button works
    onDismissed: onClose,
    onDismiss: onClose,
    dragOptions: undefined
  };

  const stackTokens: IStackTokens = { childrenGap: 15 };

  // Handlers for various input changes
  const handleMetadataChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
    setLocalOptions({
      ...localOptions,
      preserveMetadata: !!checked
    });
  };

  const handleEmailRecipientsChange = (_ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => {
    setLocalOptions({
      ...localOptions,
      emailRecipients: value
    });
    if (value && value.trim() !== '') {
      const isValid = validateEmails(value);
      setValidationErrors({
        ...validationErrors,
        email: isValid ? null : strings.InvalidEmailAddress
      });
    } else {
      setValidationErrors({ ...validationErrors, email: null });
    }
  };

  const handleEmailSubjectChange = (_ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => {
    setLocalOptions({
      ...localOptions,
      emailSubject: value
    });
  };

  const handleRichTextEmailBodyChange = (content: string): string => {
    setLocalOptions({
      ...localOptions,
      emailBody: content
    });
    return content;
  };

  const handleCustomFilenameChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
    setLocalOptions({
      ...localOptions,
      useCustomFilename: !!checked,
      ...(checked === false && { filenamePattern: '{filename}' })
    });
    if (!checked) {
      setValidationErrors({ ...validationErrors, filename: null });
    }
  };

  const handleFilenamePatternChange = (_ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => {
    const pattern = value || '{filename}';
    setLocalOptions({
      ...localOptions,
      filenamePattern: pattern
    });
    const isValid = validateFilenamePattern(pattern);
    setValidationErrors({
      ...validationErrors,
      filename: isValid ? null : strings.InvalidFilenamePattern || 'Filename contains invalid characters'
    });
  };

  // Confirm action validates inputs and closes the dialog if all is well
  const handleConfirmClick = () => {
    let hasErrors = false;
    if (!localOptions.emailRecipients || localOptions.emailRecipients.trim() === '') {
      setValidationErrors({
        ...validationErrors,
        email: strings.EmailRecipientsRequired || "Email recipients are required"
      });
      hasErrors = true;
    } else if (!validateEmails(localOptions.emailRecipients)) {
      setValidationErrors({
        ...validationErrors,
        email: strings.InvalidEmailAddress || "Invalid email address"
      });
      hasErrors = true;
    }
    if (localOptions.useCustomFilename && localOptions.filenamePattern) {
      if (!validateFilenamePattern(localOptions.filenamePattern)) {
        setValidationErrors({
          ...validationErrors,
          filename: strings.InvalidFilenamePattern || 'Filename contains invalid characters'
        });
        hasErrors = true;
      }
    }
    if (hasErrors) return;
    const finalOptions: IPdfOptions = { ...localOptions, emailBodyFormat: 'html' };
    onConfirm(finalOptions);
    onClose();
  };

  const handleClose = React.useCallback(() => {
    console.log('Dialog close handler called');
    onClose();
  }, [onClose]);

  const filenameTokensInfo = (
    <div>
      <h3>Available Tokens:</h3>
      <ul style={{ margin: '0', paddingLeft: '20px' }}>
        <li><strong>{'{filename}'}</strong> - Original filename without extension</li>
        <li><strong>{'{date}'}</strong> - Current date (YYYY-MM-DD)</li>
        <li><strong>{'{time}'}</strong> - Current time (HH-MM-SS)</li>
        <li><strong>{'{timestamp}'}</strong> - Unix timestamp</li>
        <li><strong>{'{guid}'}</strong> - Random unique ID</li>
      </ul>
      <p style={{ margin: '10px 0 0 0' }}>Example: Report-{'{filename}'}-{'{date}'}.pdf</p>
    </div>
  );

  return (
    <Dialog
      hidden={!isVisible}
      dialogContentProps={dialogContentProps}
      modalProps={dialogModalProps}
      onDismiss={handleClose}
      className={styles.container}
    >
      <Stack tokens={stackTokens} className={styles.optionGroup}>
        <TextField
          label={strings.EmailRecipientsLabel || "Email recipients (separate with semicolons)"}
          value={localOptions.emailRecipients || ''}
          onChange={handleEmailRecipientsChange}
          errorMessage={validationErrors.email || undefined}
          required
        />
        <TextField
          label={strings.EmailSubjectLabel || "Email subject"}
          value={localOptions.emailSubject || strings.EmailDefaultSubject || "PDF Document"}
          onChange={handleEmailSubjectChange}
        />
        <div className={styles.editorContainer}>
          <Label>{strings.EmailBodyLabel || "Email message"}</Label>
          <RichText
            value={localOptions.emailBody || '<p>Please find attached the PDF document.</p>'}
            onChange={handleRichTextEmailBodyChange}
            isEditMode={true}
            style={{ height: 300, marginBottom: 20 }}
          />
        </div>
        <Checkbox
          label={strings.UseCustomFilenameLabel || "Use custom filename pattern for the PDF attachment"}
          checked={localOptions.useCustomFilename}
          onChange={handleCustomFilenameChange}
          className={styles.checkboxContainer}
        />
        {localOptions.useCustomFilename && (
          <Stack tokens={{ childrenGap: 10 }} className={styles.nestedOptions}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                label={strings.FilenamePatternLabel || "Filename pattern"}
                value={localOptions.filenamePattern || '{filename}'}
                onChange={handleFilenamePatternChange}
                errorMessage={validationErrors.filename || undefined}
                style={{ flexGrow: 1 }}
              />
              <TooltipHost
                content={filenameTokensInfo}
                directionalHint={DirectionalHint.rightCenter}
                styles={{ root: { display: 'inline-block' } }}
              >
                <IconButton
                  iconProps={{ iconName: 'Info' }}
                  title="Pattern Help"
                  ariaLabel="Information about filename patterns"
                  style={{ marginTop: '25px', marginLeft: '5px' }}
                />
              </TooltipHost>
            </div>
            {validationErrors.filename && (
              <MessageBar messageBarType={MessageBarType.error}>
                {validationErrors.filename}
              </MessageBar>
            )}
          </Stack>
        )}
        <Checkbox
          label={strings.PreserveMetadataLabel || "Preserve document metadata"}
          checked={localOptions.preserveMetadata}
          onChange={handleMetadataChange}
          className={styles.checkboxContainer}
        />
      </Stack>
      <DialogFooter className={styles.footer}>
        <PrimaryButton
          onClick={handleConfirmClick}
          text={strings.SendEmailButton || "Send Email"}
          className={styles.button}
          disabled={!!validationErrors.email || (localOptions.useCustomFilename && !!validationErrors.filename)}
        />
        <DefaultButton
          onClick={handleClose}
          text={strings.CancelButton || "Cancel"}
          className={styles.button}
        />
      </DialogFooter>
    </Dialog>
  );
};

// Controller for dialog management
class PdfOptionsDialogController {
  private container: HTMLElement;
  private dispatch!: React.Dispatch<PdfOptionsDialogAction>;

  constructor() {
    this.container = document.createElement('div');
    document.body.appendChild(this.container);

    const Wrapper: React.FC = () => {
      const [state, dispatch] = React.useReducer(pdfOptionsDialogReducer, {
        isVisible: false,
        options: {
          preserveMetadata: true,
          emailAfterConversion: true,
          useCustomFilename: false,
          filenamePattern: '{filename}',
          emailBodyFormat: 'html'
        },
        onConfirm: () => {},
        validationErrors: { email: null, filename: null }
      });

      this.dispatch = dispatch;

      // Explicitly define the close handler
      const handleClose = React.useCallback(() => {
        console.log('Close action triggered from wrapper');
        dispatch({ type: 'CLOSE_DIALOG' });
      }, [dispatch]);

      return (
        <PdfOptionsDialogContent
          options={state.options}
          isVisible={state.isVisible}
          onClose={handleClose}
          onConfirm={state.onConfirm}
        />
      );
    };

    ReactDOM.render(<Wrapper />, this.container);
  }

  public show(options: IPdfOptions, onConfirm: (options: IPdfOptions) => void) {
    this.dispatch({
      type: 'SHOW_DIALOG',
      options: { ...options, emailBodyFormat: 'html' },
      onConfirm
    });
    Log.info('PdfOptionsDialogController', 'Showing PDF email dialog');
  }

  public close() {
    this.dispatch({ type: 'CLOSE_DIALOG' });
    Log.info('PdfOptionsDialogController', 'Closing PDF email dialog');
  }

  // Cleanup method to unmount the component
  public destroy() {
    ReactDOM.unmountComponentAtNode(this.container);
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    Log.info('PdfOptionsDialogController', 'Dialog component unmounted and destroyed');
  }
}

export default new PdfOptionsDialogController();