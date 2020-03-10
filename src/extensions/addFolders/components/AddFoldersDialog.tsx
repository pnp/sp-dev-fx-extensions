
import * as React from 'react';
import { Dialog, DialogType, DialogFooter, DefaultButton } from 'office-ui-fabric-react';
import FolderController from './FolderController';
import { ListViewCommandSetContext } from '@microsoft/sp-listview-extensibility';
import { useState, useEffect } from 'react';
import * as strings from 'AddFoldersCommandSetStrings';

export interface IAddFoldersDialogProps {
  context: ListViewCommandSetContext;
  location: string;
  displayDialog: boolean;
  commandTitle: string;
  closeDialog: () => void;
}

export interface IAddFoldersDialogState {
  hideDialog: boolean;
}

const AddFoldersDialog: React.FunctionComponent<IAddFoldersDialogProps> = (props) => {

  const [hideDialog, setHideDialog] = useState(!props.displayDialog);

  useEffect(() => {
    setHideDialog(!props.displayDialog);
  }, [props.displayDialog]);

  return (
    <div>
      <Dialog
        hidden={hideDialog}
        minWidth={700}
        dialogContentProps={{
          type: DialogType.normal,
          title: props.commandTitle,
        }}
        onDismiss={props.closeDialog}>
        <FolderController context={props.context} currentLocation={props.location} />
        <DialogFooter>
          <DefaultButton onClick={props.closeDialog} text={strings.ButtonGlobalClose} />
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default AddFoldersDialog;
