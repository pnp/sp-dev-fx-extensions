import * as React from 'react';
import { MessageBar, MessageBarType, PrimaryButton, ProgressIndicator } from '@fluentui/react';
import TemplateButtons from './TemplateButtons';

/* eslint-disable @rushstack/no-new-null */
interface Props {
  isSubmitting: boolean;
  copyPage: (isTemplate: boolean) => void;
  disabled: boolean;
  message: { type: MessageBarType; text: string } | null;
  isTemplate: boolean;
}
/* eslint-enable @rushstack/no-new-null */

export const CopyPageActions: React.FC<Props> = ({
  isSubmitting,
  copyPage,
  disabled,
  message,
  isTemplate
}) => (
  <>
    <PrimaryButton
      text={isSubmitting ? 'Copying...' : 'Copy Page'}
      onClick={() => copyPage(false)}
      disabled={disabled}
      styles={{ root: { width: '100%' } }}
      ariaLabel="Copy Page"
      ariaDescription="Click to copy the page to the selected destination site."
      iconProps={{ iconName: 'Copy' }}
    />

    {isSubmitting && !isTemplate && (
      <ProgressIndicator
        label="Copying..."
        description="Please wait while the page is being copied."
      />
    )}

    <TemplateButtons
      copyPage={copyPage}
      disabled={disabled}
    />

    {isSubmitting && isTemplate && (
      <ProgressIndicator
        label="Saving Template..."
        description="Please wait while the page is being saved as a template."
      />
    )}

    {/* Explanatory text below the buttons */}
    <MessageBar
      messageBarType={MessageBarType.info}
      styles={{ root: { marginTop: 10, backgroundColor: '#f3f2f1', color: '#323130' } }}
    >
      <strong>Local Templates:</strong> Save the page as a template in the target site only. <br />
    </MessageBar>

    {message && (
      <MessageBar
        messageBarType={message.type || MessageBarType.blocked}
        isMultiline={true}
        onDismiss={() => null}
        dismissButtonAriaLabel="Close"
        truncated={true}
      >
        {message.text}
      </MessageBar>
    )}
  </>
);
