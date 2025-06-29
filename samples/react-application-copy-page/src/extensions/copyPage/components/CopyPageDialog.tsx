import * as React from 'react';
import { Dialog, Stack } from '@fluentui/react';
import CopyPageForm from './CopyPageForm';
import { ISPFXContext } from '@pnp/sp';

const modelProps = { isBlocking: true, topOffsetFixed: false };

interface Props {
  hidden: boolean;
  onDismiss: () => void;
  context: ISPFXContext;
  pageName: string;
  pageUrl: string;
}

const CopyPageDialog: React.FC<Props> = ({
  hidden, onDismiss, context, pageName, pageUrl
}) => (
  <Dialog hidden={hidden} onDismiss={onDismiss} modalProps={modelProps} minWidth={550}>
    <h1 style={{ margin: 0, marginBottom: 6 }}>Copy Page to Another Site</h1>
    <Stack tokens={{ childrenGap: 16 }}>
      <CopyPageForm
        context={context}
        pageName={pageName}
        pageUrl={pageUrl}
      />
    </Stack>
  </Dialog>
);

export default CopyPageDialog;
