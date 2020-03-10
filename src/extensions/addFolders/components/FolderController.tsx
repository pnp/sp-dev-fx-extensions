import * as React from 'react';
import FolderHierarchyGenerator from './FolderHierarchyGenerator';
import { useState } from 'react';
import { sp } from '@pnp/sp';
import "@pnp/sp/webs";
import { IFolderAddResult } from '@pnp/sp/folders';
import '@pnp/sp/folders';
import IFolder from '../../../interfaces/IFolder';
import { ListViewCommandSetContext } from '@microsoft/sp-listview-extensibility';

interface IFolderControllerProps {
  context: ListViewCommandSetContext;
  currentLocation: string;
}

const FolderController: React.FunctionComponent<IFolderControllerProps> = (props) => {

  const [batchFolders, setBatchFolders] = useState([]);

  async function _addFolders(folders: IFolder[], nested: boolean) {
    setBatchFolders([] as IFolder[]);

    let currentFolderRelativeUrl = props.currentLocation;

    let batchAddFolders = null;

    if (!nested) {
      batchAddFolders = sp.web.createBatch();
    }

    try {
      for (let fol of folders) {
        if(nested) {
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

      if (!nested) {
        await batchAddFolders.execute();
      }

    } catch (globalError) {
      console.log('Global error');
      console.log(globalError);
    }
  }

  return (
    <FolderHierarchyGenerator handleAddFolder={_addFolders} context={props.context} batchStatus={batchFolders} />
  );
};

export default FolderController;
