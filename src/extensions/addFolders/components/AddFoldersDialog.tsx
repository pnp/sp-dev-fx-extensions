
import * as React from 'react';
import FolderController from './FolderController';
import { ListViewCommandSetContext } from '@microsoft/sp-listview-extensibility';
import { useState, useEffect } from 'react';

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

  const [dialogState, setDialogState] = useState(!props.displayDialog);

  useEffect(() => {
    setDialogState(!props.displayDialog);
  }, [props.displayDialog]);

  return (
    <div>
      <FolderController
        context={props.context}
        currentLocation={props.location}
        commandTitle={props.commandTitle}
        hideDialog={dialogState}
        closeDialog={props.closeDialog} />
    </div>
  );
};

export default AddFoldersDialog;
