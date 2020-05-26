import * as React from 'react';
import FolderHierarchyGenerator from './FolderHierarchyGenerator';
import styles from './FolderHierarchyGenerator.module.scss';
import { useState, useReducer, useEffect } from 'react';
import { sp } from '@pnp/sp';
import "@pnp/sp/webs";
import { IFolderAddResult } from '@pnp/sp/folders';
import '@pnp/sp/folders';
import IFolder from '../../../interfaces/IFolder';
import { ListViewCommandSetContext } from '@microsoft/sp-listview-extensibility';
import { Dialog, DialogType, DialogFooter, DefaultButton, PrimaryButton, IBreadcrumbItem,
  IOverflowSetItemProps, IContextualMenuProps, getId, IStackTokens, IBreadCrumbData,
  BaseButton, Button, KeyCodes, ITextFieldStyleProps, ITextFieldStyles, TooltipHost,
  Spinner, SpinnerSize, Icon, ITextFieldProps, Stack, IconButton, IButtonProps,
  MessageBar, MessageBarType, Label, TextField, Toggle, Callout, DirectionalHint,
  Breadcrumb, OverflowSet, Separator
} from 'office-ui-fabric-react';
import * as strings from 'AddFoldersCommandSetStrings';
import { FolderStatus } from '../../../constants/FolderStatus';
import { TaskState } from '../../../constants/TaskState';
import ICustomItem from '../../../interfaces/ICustomItem';
import { Constants } from '../../../constants/Constants';
import FolderButton from './FolderButton';

interface IFolderControllerProps {
  context: ListViewCommandSetContext;
  currentLocation: string;
  commandTitle: string;
  hideDialog: boolean;
  closeDialog: () => void;
}

const FolderController: React.FunctionComponent<IFolderControllerProps> = (props) => {
  let _errorInfoId: string = getId('errorInfo');
  let _addIconId: string = getId('addIcon');

  const [batchFolders, setBatchFolders] = useState([]);
  const [folderNameRegExInfo, setFolderNameRegExInfo] = useState(false);
  const [folderNameIsValid, setFolderNameIsValid] = useState(true);
  const [taskStatus, setTaskStatus] = useState(TaskState.none);
  const [overflowFolders, _setOverflowFolders] = useState([] as IBreadcrumbItem[]);
  const [folderName, setFolderName] = useState('');
  const [folderLengthWarn, setFolderLengthWarn] = useState(false);
  const [parallelFoldersWarn, setParallelFoldersWarn] = useState(false);
  const [nestedFolders, setNestedFolders] = useState(true);
  const [folders, dispatchFolders] = useReducer((arr, { type, value }) => {
    switch (type) {
      case "add":
        return [...arr, value];
      case "remove":
        return arr.filter(_ => _ !== value);
      case "replace":
        return value;
      case "reset":
        return [];
      default:
        return arr;
    }
  }, [] as ICustomItem[]);

  const overflowFoldersRef = React.useRef(overflowFolders);

  const setOverflowFolders = f => {
    overflowFoldersRef.current = f;
    _setOverflowFolders(f);
  };

  useEffect(() => {
    let keepLoading: boolean = true;

    if (batchFolders.length > 0 && folders.length > 0) {
      let _folders = [...folders];

      let lastTask = batchFolders[batchFolders.length - 1];
      let _folderToUpdate = _folders.filter(_fol => _fol.key === lastTask.key)[0];
      let indexFolderToUpdate = _folders.indexOf(_folderToUpdate);

      if (lastTask.created) {
        _folders[indexFolderToUpdate].status = FolderStatus.created;
        keepLoading = _folders.filter(fol => fol.status === FolderStatus.none).length > 0;
      }
      else {
        if (nestedFolders) {
          _folders = _folders.map((fol) => {
            if (fol.status === FolderStatus.none) {
              fol.status = FolderStatus.failed;
            }

            return fol;
          });

          keepLoading = false;
        }
        else {
          _folders[indexFolderToUpdate].status = FolderStatus.failed;
          keepLoading = _folders.filter(fol => fol.status === FolderStatus.none).length > 0;
        }
      }

      dispatchFolders({type: "replace", value: _folders});


      if (keepLoading) {
        setTaskStatus(TaskState.progress);
      }
      else {
        setTaskStatus(TaskState.done);
      }
    }

  }, [batchFolders]);

  useEffect(() => {
    setFolderLengthWarn(isTotalUrlTooLong());
    setParallelFoldersWarn(!nestedFolders && folders.length > Constants.maxParallelFolders);

  }, [nestedFolders, folders]);

  const calloutStackTokens: IStackTokens = {
    childrenGap: 20,
    maxWidth: 400
  };

  const foldersStackTokens: IStackTokens = {
    childrenGap: 20
  };

  const btnCreateFoldersDisabled =
    taskStatus === TaskState.progress
    || folderLengthWarn
    || parallelFoldersWarn
    || folders.length === 0;

  const folderMenuProps: IContextualMenuProps = {
    items: [
      {
        key: 'retryFailedTasks',
        text: strings.FolderMenuRetry,
        onClick: retryFailedFoldersClick
      }
    ]
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
        if (nestedFolders) {
          await sp.web.folders.add(currentFolderRelativeUrl + "/" + fol.value)
            .then((value: IFolderAddResult) => {
              currentFolderRelativeUrl = value.data.ServerRelativeUrl;
              setBatchFolders(oldBatchFolders => [...oldBatchFolders, { key: fol.key, value: fol.value, created: true }]);
            })
            .catch((nestedError: any) => {
              console.error(`Error during the creation of the folder [${fol.value}]`);
              setBatchFolders(oldBatchFolders => [...oldBatchFolders, { key: fol.key, value: fol.value, created: false }]);
              throw nestedError;
            });
        }
        else {
          sp.web.folders.inBatch(batchAddFolders).add(currentFolderRelativeUrl + "/" + fol.value)
            .then(_ => {
              console.log(`Folder [${fol.value}] created`);
              setBatchFolders(oldBatchFolders => [...oldBatchFolders, { key: fol.key, value: fol.value, created: true }]);
            })
            .catch((batchError: any) => {
              console.error(`Error during the creation of the folder [${fol.value}]`);
              console.error(batchError);
              setBatchFolders(oldBatchFolders => [...oldBatchFolders, { key: fol.key, value: fol.value, created: false }]);
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

  function isTotalUrlTooLong() {
    let _foldersPath = '';
    let isUrlTooLong: boolean = false;

    if (nestedFolders) {
      folders.forEach((fol, i) => {
        _foldersPath += fol.value + (i < folders.length - 1 ? '/' : '');
      });

      isUrlTooLong = props.context.pageContext.web.absoluteUrl.length + _foldersPath.length >= Constants.maxTotalUrlLength;
    }
    else {
      isUrlTooLong = folders.some((fol) => props.context.pageContext.web.absoluteUrl.length + ('/' + fol.value).length >= Constants.maxTotalUrlLength);
    }

    return isUrlTooLong;
  }

  function addFolderToHierarchy() {
    if (folderName.trim() != '' && folderNameIsValid) {
      let folderToAdd: ICustomItem = {
        key: folderName + '_' + Math.random().toString(36).substr(2, 9),
        text: folderName,
        onClick: selectFolderClick,
        status: FolderStatus.none,
        hidden: false,
        value: folderName
      };

      dispatchFolders({type: "add", value: folderToAdd});
      setFolderName('');
    }
  }

  function selectFolderClick(ev: React.MouseEvent<HTMLElement | BaseButton | Button, MouseEvent>, folderToRemove: IBreadcrumbItem | IOverflowSetItemProps) {
    if (taskStatus !== TaskState.progress) {
      if (folders.length === 0 && taskStatus === TaskState.done) {
        eraseFoldersClick();
      }
      else {
        dispatchFolders({type: "remove", value: folderToRemove});
      }
    }
  }

  function folderTextFieldChange(ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string) {
    setFolderName(text);

    return text;
  }

  function folderTextFieldKeyDown(ev: React.KeyboardEvent<HTMLElement>) {
    const keyCode = ev.which;

    switch (keyCode) {
      case KeyCodes.tab:
      case KeyCodes.enter:
        addFolderToHierarchy();
        ev.preventDefault();
        ev.stopPropagation();
        break;
    }
  }

  function createFoldersClick() {
    setTaskStatus(TaskState.progress);

    let _folds = folders.map((fol) => {
      return { key: fol.key, value: fol.value };
    }) as IFolder[];

    _addFolders(_folds);
  }

  function eraseFoldersClick() {
    dispatchFolders({type: "reset"});
    setTaskStatus(TaskState.none);

    if (nestedFolders) {
      setOverflowFolders([]);
    }
  }

  function retryFailedFoldersClick() {
    setTaskStatus(TaskState.progress);

    // let foldersToRetry = folders.map((fol) => {
    //   return {key: fol.key, value: fol.value};
    // }) as IFolder[];

    let _folders = folders.map((fol) => {
      if (fol.status === FolderStatus.failed) {
        fol.status = FolderStatus.none;
      }

      return fol;
    });

    dispatchFolders({type: "replace", value: _folders});
  }

  function errorInfoIconClick() {
    setFolderNameRegExInfo(true);
  }

  function errorInfoIconDismiss() {
    setFolderNameRegExInfo(false);
  }

  function changeFolderCreationDirectionClick(event: React.MouseEvent<HTMLElement>, checked?: boolean) {
    setNestedFolders(checked);
  }

  function getTextFieldStyles(stylesProps: ITextFieldStyleProps): Partial<ITextFieldStyles> {
    let color = folderNameIsValid ? stylesProps.theme.semanticColors.inputText : stylesProps.theme.semanticColors.errorText;
    let after = folderNameIsValid ? stylesProps.theme.semanticColors.inputBackgroundChecked : stylesProps.theme.semanticColors.errorText;

    return {
      fieldGroup: [
        {
          borderColor: stylesProps.disabled ? 'rgb(243, 242, 241)' : color,
          selectors: {
            '&:hover': {
              borderColor: color
            },
            ':after': {
              borderColor: after
            },
            '[disabled]': {
              backgroundColor: 'rgb(243, 242, 241)'
            }
          }
        }
      ]
    };
  }

  function folderNameErrorMessage(txtProps: ITextFieldProps) {
    let matchFolderName: RegExpMatchArray = null;

    if (txtProps.value != '') {
      // usual folder name check
      matchFolderName = txtProps.value.match(Constants.folderNameRegEx);

      if (matchFolderName === null) {
        if (props.currentLocation.split('/').length === 2 && props.currentLocation.indexOf('lists/') < 0) {
          // Reject if folder name submitted is "forms" if current location is root folder (library only)
          matchFolderName = txtProps.value.match(Constants.folderNameRootLibraryRegEx);
        }
        else if (props.currentLocation.split('/').length === 3 && props.currentLocation.indexOf('/Lists/') >= 0) {
          // Reject if folder name submitted is "attachments" if current location is root folder (list only)
          matchFolderName = txtProps.value.match(Constants.folderNameRootListRegEx);
        }
      }
    }

    setFolderNameIsValid(matchFolderName === null || txtProps.value == '');

    return (
      <>
        <Stack horizontal verticalAlign="center" className={styles.labelerror}>
          <span>{txtProps.label}</span>
          <div>
            {matchFolderName !== null &&
              <IconButton
                id={_errorInfoId}
                iconProps={{ iconName: 'Error' }}
                title="Error"
                onClick={errorInfoIconClick}
                className={styles.foldererror}
              />
            }
          </div>
        </Stack>
      </>);
  }

  function onRenderItem(item: ICustomItem) {
    let tooltipItem: string = strings.TooltipFolderDelete;
    let classIcon: string = '';
    let icon: string = '';
    let isInProgress: boolean = taskStatus === TaskState.progress && item.status === FolderStatus.none;

    switch (item.status) {
      case FolderStatus.created:
        classIcon = styles.addsuccess;
        icon = 'StatusCircleCheckmark';
        tooltipItem = strings.TooltipFolderStatusSuccess;
        break;

      case FolderStatus.failed:
        classIcon = styles.addfailure;
        icon = 'StatusCircleErrorX';
        tooltipItem = strings.TooltipFolderStatusFailure;
        break;
    }

    if (isInProgress) {
      tooltipItem = strings.TooltipFolderStatusProgress;
    }

    return (
      <TooltipHost content={tooltipItem}>
        <FolderButton onClick={(ev) => selectFolderClick(ev, item)} isNested={nestedFolders}
          render={
            <>
              {`${item.value} `}
              {taskStatus === TaskState.none && item.status === FolderStatus.none &&
                <div className={styles.blankarea}></div>
              }
              {isInProgress &&
                <Spinner className={styles.addloading} size={SpinnerSize.xSmall} />
              }
              {item.status !== FolderStatus.none &&
                <Icon className={classIcon} iconName={icon} />
              }
            </>
          } />
      </TooltipHost>
    );
  }

  function displayedFoldersReduceData(foldersData: IBreadCrumbData) {
    let folderStatusText = '';
    let folderToHide = foldersData.renderedItems[0] as ICustomItem;
    folderToHide.hidden = true;

    switch (folderToHide.status) {
      case FolderStatus.created:
        folderStatusText = strings.OverflowSuffixFolderStatusSuccess;
        break;

      case FolderStatus.failed:
        folderStatusText = strings.OverflowSuffixFolderStatusFailure;
        break;
    }

    if (folderToHide.text.indexOf(folderStatusText) < 0) {
      folderToHide.text += folderStatusText;
    }

    foldersData.renderedOverflowItems.push(folderToHide);

    setOverflowFolders(foldersData.renderedOverflowItems);
    foldersData.renderedItems = foldersData.renderedItems.slice(1, foldersData.renderedItems.length);

    return foldersData;
  }

  function renderOverFlow(buttonProps: IButtonProps) {
    let hiddenFolders: ICustomItem[] = folders.filter(fol => fol.hidden);
    let totalHiddenFoldersHandled: number = hiddenFolders.filter(fol => fol.status !== FolderStatus.none).length;
    let totalHiddenFoldersSuccess: number = hiddenFolders.filter(fol => fol.status === FolderStatus.created).length;
    let totalHiddenFoldersFailed: number = hiddenFolders.filter(fol => fol.status === FolderStatus.failed).length;
    let overflowText: string = '...';

    let uploadOccurred: boolean = taskStatus !== TaskState.none && (totalHiddenFoldersSuccess > 0 || totalHiddenFoldersFailed > 0);

    if (taskStatus === TaskState.progress && totalHiddenFoldersHandled !== hiddenFolders.length
      || uploadOccurred) {
      overflowText = `${totalHiddenFoldersSuccess}/${hiddenFolders.length}`;
    }

    let nbFoldersOverflowText = 0;

    if (totalHiddenFoldersFailed > 0) {
      nbFoldersOverflowText = totalHiddenFoldersSuccess;
    }
    else if (totalHiddenFoldersHandled === hiddenFolders.length) {
      nbFoldersOverflowText = hiddenFolders.length;
    }
    else {
      nbFoldersOverflowText = overflowFoldersRef.current.length;
    }

    let tooltipOverflowText: string = `${nbFoldersOverflowText} ${(taskStatus !== TaskState.done && !uploadOccurred ?
      strings.TooltipOverflowSuffixFoldersToCreate :
      strings.TooltipOverflowSuffixFoldersCreated)}`;

    return (
      <div>
        <TooltipHost content={`${tooltipOverflowText}`}>
          <DefaultButton className={styles.overflow}>
            {`${overflowText} `}
            {taskStatus === TaskState.progress && totalHiddenFoldersHandled !== hiddenFolders.length &&
              <Spinner className={styles.addoverflowloading} size={SpinnerSize.xSmall} />
            }
            {taskStatus !== TaskState.none && totalHiddenFoldersSuccess === hiddenFolders.length &&
              <Icon className={styles.addoverflowsuccess} iconName='StatusCircleCheckmark' />
            }
            {taskStatus === TaskState.done && hiddenFolders.filter(fol => fol.status === FolderStatus.failed).length > 0 &&
              <Icon className={styles.addoverflowwarning} iconName='StatusCircleExclamation' />
            }
          </DefaultButton>
        </TooltipHost>
      </div>
    );
  }

  function closeDialog() {
    setFolderName('');
    setNestedFolders(true);
    eraseFoldersClick();
    props.closeDialog();
  }

  return (
    <Dialog
      hidden={props.hideDialog}
      minWidth={700}
      dialogContentProps={{
        type: DialogType.normal,
        title: props.commandTitle,
      }}
      onDismiss={closeDialog}>
      <div className={styles.folderHierarchyGenerator}>
        <div className={styles.messages}>
          {folderLengthWarn &&
            <MessageBar messageBarType={MessageBarType.severeWarning}>{`${strings.MessageBarTooManyCharacters} ${Constants.maxTotalUrlLength}`}</MessageBar>
          }
          {parallelFoldersWarn &&
            <MessageBar messageBarType={MessageBarType.severeWarning}>{`${strings.MessageBarMaxFoldersBatch} ${Constants.maxParallelFolders}`}</MessageBar>
          }
        </div>
        <div className={styles.container}>
          <Label className={styles.location}>{`${strings.LabelCurrentLocation} ${props.currentLocation.replace('/Lists', '').substring(1)}`}</Label>
          <Stack horizontal verticalAlign="end" tokens={foldersStackTokens}>
            <TooltipHost content={strings.TextFieldDescription}>
              <TextField
                label={strings.TextFieldLabel}
                styles={getTextFieldStyles}
                onRenderLabel={folderNameErrorMessage}
                value={folderName}
                onKeyDown={folderTextFieldKeyDown}
                onChange={folderTextFieldChange}
                disabled={taskStatus === TaskState.progress || taskStatus === TaskState.done && folders.filter(fol => fol.status === FolderStatus.failed).length === 0}
                autoComplete='off' />
            </TooltipHost>
            <TooltipHost
              content={strings.TooltipFolderAdd}>
              <IconButton onClick={addFolderToHierarchy} iconProps={{iconName: "NewFolder"}} disabled={!folderNameIsValid} />
            </TooltipHost>
          </Stack>
          <Toggle
            defaultChecked={nestedFolders}
            inlineLabel
            label={strings.ToggleSelectFoldersCreationMode}
            onChange={changeFolderCreationDirectionClick}
            disabled={taskStatus !== TaskState.none} />
          {folderNameRegExInfo &&
            <Callout
              target={'#' + _errorInfoId}
              setInitialFocus={true}
              onDismiss={errorInfoIconDismiss}
              role="alertdialog"
              directionalHint={DirectionalHint.bottomCenter}>
              <Stack tokens={calloutStackTokens} horizontalAlign='start' styles={{ root: { padding: 20 } }}>
                <span>{strings.CalloutBannedCharacters} <b>&laquo;</b> <b>*</b> <b>:</b> <b>&lt;</b> <b>&gt;</b> <b>?</b> <b>/</b> <b>\</b> <b>|</b></span>
                <span>{strings.CalloutBannedWords} <b>con</b>, <b>PRN</b>, <b>aux</b>, <b>nul</b>, <b>com0 - COM9</b>, <b>lpt0 - LPT9</b>, <b>_vti_</b></span>
                <span>{strings.CalloutBannedPrefixCharacters} <b>~</b> <b>$</b></span>
                <span>"<b>forms</b>" {strings.CalloutBannedFormsWordAtRoot}</span>
                <span>"<b>attachments</b>" {strings.CalloutBannedAttachmentsWordAtRoot}</span>
                <span>{strings.CalloutBannedCharactersUrl} <a target='_blank' href='https://support.office.com/en-us/article/invalid-file-names-and-file-types-in-onedrive-onedrive-for-business-and-sharepoint-64883a5d-228e-48f5-b3d2-eb39e07630fa'>{strings.CalloutBannedCharactersUrlLink}</a></span>
                <DefaultButton onClick={errorInfoIconDismiss} text={strings.ButtonGlobalClose} />
              </Stack>
            </Callout>
          }
          <Separator />
          <div className={styles.folderscontainer}>
            {nestedFolders ?
              <Breadcrumb className={styles["folders-brdcrmb"]} items={folders} onRenderOverflowIcon={renderOverFlow} onRenderItem={onRenderItem} onReduceData={displayedFoldersReduceData} />
              :
              <div className={styles.dialogContainer}>
                <OverflowSet
                  vertical
                  items={folders}
                  onRenderItem={onRenderItem}
                  onRenderOverflowButton={null} />
              </div>
            }
          </div>
        </div>
      </div>
      <DialogFooter>
        {taskStatus === TaskState.done &&
          <PrimaryButton
            split
            menuProps={
              folders.filter(fol => fol.status === FolderStatus.failed).length > 0 && folderMenuProps
            }
            text={strings.ButtonClearSelection}
            onClick={eraseFoldersClick} />
        }
        {taskStatus !== TaskState.done &&
          <PrimaryButton
            text={strings.ButtonCreateFolders}
            onClick={createFoldersClick}
            disabled={btnCreateFoldersDisabled} />
        }
        <DefaultButton onClick={closeDialog} text={strings.ButtonGlobalClose} />
      </DialogFooter>
    </Dialog>
  );
};

export default FolderController;
