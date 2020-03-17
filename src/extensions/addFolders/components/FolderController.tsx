import * as React from 'react';
import FolderHierarchyGenerator from './FolderHierarchyGenerator';
import { useState, useRef, useEffect } from 'react';
import { sp } from '@pnp/sp';
import "@pnp/sp/webs";
import { IFolderAddResult } from '@pnp/sp/folders';
import '@pnp/sp/folders';
import IFolder from '../../../interfaces/IFolder';
import { ListViewCommandSetContext } from '@microsoft/sp-listview-extensibility';
import { Dialog, DialogType, DialogFooter, DefaultButton, PrimaryButton, IBreadcrumbItem, IOverflowSetItemProps, IContextualMenuProps } from 'office-ui-fabric-react';
import * as strings from 'AddFoldersCommandSetStrings';
import { FolderStatus } from '../../../constants/FolderStatus';
import { TaskState } from '../../../constants/TaskState';
import ICustomItem from '../../../interfaces/ICustomItem';

interface IFolderControllerProps {
  context: ListViewCommandSetContext;
  currentLocation: string;
  commandTitle: string;
  hideDialog: boolean;
  closeDialog: () => void;
}

const FolderController: React.FunctionComponent<IFolderControllerProps> = (props) => {

  const [batchFolders, setBatchFolders] = useState([]);
  const [taskStatus, _setTaskStatus] = useState(TaskState.none);
  const [folders, _setFolders] = useState([] as ICustomItem[]);
  const [overflowFolders, _setOverflowFolders] = useState([] as IBreadcrumbItem[]);
  const [nestedFolders, setNestedFolders] = useState(true);

  const foldersRef = React.useRef(folders);
  const taskStatusRef = React.useRef(taskStatus);
  const overflowFoldersRef = React.useRef(overflowFolders);

  const setTaskStatus = f => {
    taskStatusRef.current = f;
    _setTaskStatus(f);
  };

  const setFolders = f => {
    foldersRef.current = f;
    _setFolders(f);
  };

  const setOverflowFolders = f => {
    overflowFoldersRef.current = f;
    _setOverflowFolders(f);
  };

  async function _addFolders(foldersToAdd: IFolder[]) {
    setBatchFolders([] as IFolder[]);

    let currentFolderRelativeUrl = props.currentLocation;

    let batchAddFolders = null;

    if (!nestedFolders) {
      batchAddFolders = sp.web.createBatch();
    }

    try {
      for (let fol of foldersToAdd) {
        if(nestedFolders) {
          await sp.web.folders.add(currentFolderRelativeUrl + "/" + fol.value)
          .then((value: IFolderAddResult) => {
            currentFolderRelativeUrl = value.data.ServerRelativeUrl;
            setBatchFolders(oldBatchFolders => [...oldBatchFolders, {key: fol.key, value:fol.value, created: true}]);
          })
          .catch((nestedError: any) => {
            console.error(`Error during the creation of the folder [${fol.value}]`);
            setBatchFolders(oldBatchFolders => [...oldBatchFolders, {key: fol.key, value:fol.value, created: false}]);
            throw nestedError;
          });
        }
        else {
          sp.web.folders.inBatch(batchAddFolders).add(currentFolderRelativeUrl + "/" + fol.value)
          .then(_ => {
            console.log(`Folder [${fol.value}] created`);
            setBatchFolders(oldBatchFolders => [...oldBatchFolders, {key: fol.key, value:fol.value, created: true}]);
          })
          .catch((batchError: any) => {
            console.error(`Error during the creation of the folder [${fol.value}]`);
            console.error(batchError);
            setBatchFolders(oldBatchFolders => [...oldBatchFolders, {key: fol.key, value:fol.value, created: false}]);
          });
        }
      }

      if (!nestedFolders) {
        await batchAddFolders.execute();
      }

    } catch (globalError) {
      console.log('Global error');
      console.log(globalError);
    }
  }

  const folderMenuProps: IContextualMenuProps = {
    items: [
      {
        key: 'retryFailedTasks',
        text: strings.FolderMenuRetry,
        onClick: retryFailedFoldersClick
      }
    ]
  };

  function updateNested(nestedStatus: boolean) {
    setNestedFolders(nestedStatus);
  }

  return (
    <Dialog
      hidden={props.hideDialog}
      minWidth={700}
      dialogContentProps={{
        type: DialogType.normal,
        title: props.commandTitle,
      }}
      onDismiss={props.closeDialog}>
      <FolderHierarchyGenerator
        context={props.context}
        batchStatus={batchFolders}
        folderLocation={props.currentLocation}
        folders={foldersRef.current}
        handleAddFolder={_addFolders}
        handleUpdateFolders={(updatedFolders) => setFolders(updatedFolders)}
        taskStatus={taskStatus}
        updateTaskStatus={_updateTaskStatus}
        nested={nestedFolders}
        handleNested={updateNested}
        overflowFolders={overflowFoldersRef.current}
        handleOverflowFolders={(updatedOverflowFolders) => setOverflowFolders(updatedOverflowFolders)} />
      <DialogFooter>
      {taskStatusRef.current === TaskState.done &&
        <PrimaryButton
        split
        menuProps={
          foldersRef.current.filter(fol => fol.status === FolderStatus.failed).length > 0 && folderMenuProps
        }
        text={strings.ButtonClearSelection}
        onClick={eraseFoldersClick} />
      }
      {(taskStatusRef.current === TaskState.none || taskStatusRef.current === TaskState.progress) &&
        <PrimaryButton
          text={strings.ButtonCreateFolders}
          onClick={folderCreationClick}
          disabled={taskStatusRef.current === TaskState.progress} />
      }
        <DefaultButton onClick={props.closeDialog} text={strings.ButtonGlobalClose} />
      </DialogFooter>
    </Dialog>
  );

  function _updateTaskStatus(task: TaskState) {
    setTaskStatus(task);
  }

  function folderCreationClick() {
    let _folds = foldersRef.current.map((fol) => {
      return {key: fol.key, value: fol.value};
    }) as IFolder[];

    _addFolders(_folds);
  }

  function eraseFoldersClick() {
    setFolders([]);
    setTaskStatus(TaskState.none);
  }

  function retryFailedFoldersClick() {
    setTaskStatus(TaskState.progress);
    // setTaskStatus(TaskState.progress);

    let foldersToRetry = folders.map((fol) => {
      return {key: fol.key, value: fol.value};
    }) as IFolder[];

    let _folders = folders.map((fol) => {
      if (fol.status === FolderStatus.failed) {
        fol.status = FolderStatus.none;
      }

      return fol;
    });

    setFolders(_folders);

    _addFolders(foldersToRetry);
  }
};

export default FolderController;
