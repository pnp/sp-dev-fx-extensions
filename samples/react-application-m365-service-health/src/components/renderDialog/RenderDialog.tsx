import * as React from 'react';

import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  mergeClasses,
} from '@fluentui/react-components';

import { IRenderDialogProps } from './IRenderDialogProps';
import { useStyles } from './useStyles';

const DEFAULT_MIN_WIDTH = 200;
const DEFAULT_MIN_HEIGHT = 200;

export const RenderDialog: React.FunctionComponent<IRenderDialogProps> = (
  props: React.PropsWithChildren<IRenderDialogProps>
) => {
  const { isOpen, dialogTitle, dialogActions, children, maxWidth, className, minHeight, minWidth, maxHeight } = props;
  const styles = useStyles();
  if (!isOpen) return <></>;
  return (
    <Dialog open={isOpen} modalType="modal">
      <DialogSurface
        className={mergeClasses(styles.dialog, className)}
        style={{
          maxWidth: maxWidth,
          minWidth: minWidth ?? DEFAULT_MIN_WIDTH,
          minHeight: minHeight ?? DEFAULT_MIN_HEIGHT,
          height: "fit-content",
          maxHeight: maxHeight ?? "",
        }}
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogBody className={styles.dialogBody}>
          <DialogContent>{children}</DialogContent>
        </DialogBody>
        <DialogActions fluid position="end">
          {dialogActions}
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};
