import * as React from 'react';
import { Button, Dialog, DialogBody, DialogContent, DialogSurface, DialogTitle, Text } from '@fluentui/react-components';
import { CheckmarkFilled, CopyRegular } from '@fluentui/react-icons';
import { Drive } from '@microsoft/microsoft-graph-types';

interface IDriveDetailsDialogProps {
  driveDetails: Drive;
  onClose: () => void;
}

const Detail = (props: { value: string | undefined; label: string; showCopy?: boolean }): JSX.Element => {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (copied) {
      const timer = window.setTimeout(() => setCopied(false), 3000);
      return () => window.clearTimeout(timer);
    }
  }, [copied]);

  const onCopyClick = async (): Promise<void> => {
    if (!props.value) return;
    try {
      await navigator.clipboard.writeText(props.value);
      setCopied(true);
    } catch (ex) {
      console.log(ex);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
      <Text weight="semibold" style={{ minWidth: 120 }}>{props.label}</Text>
      <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 20 }}>
        <Text>{props.value ?? ''}</Text>
        {props.value && props.showCopy && <Button icon={!copied ? <CopyRegular /> : <CheckmarkFilled />} appearance="transparent" onClick={onCopyClick} />}
      </div>
    </div>
  );
};

export const DriveDetailsDialog = (props: IDriveDetailsDialogProps): JSX.Element => {
  return (
    <Dialog open={true} onOpenChange={(_, data) => !data.open && props.onClose()} modalType="non-modal">
      <DialogSurface style={{ maxWidth: 850 }}>
        <DialogBody>
          <DialogTitle>Details</DialogTitle>
          <DialogContent>
            <Detail value={props.driveDetails.description ?? ''} label="Description" showCopy={true} />
            <Detail value={props.driveDetails.id} label="Drive Id" showCopy={true} />
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
