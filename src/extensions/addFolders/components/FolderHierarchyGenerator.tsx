import * as React from 'react';
import { useState, useReducer, useEffect } from 'react';
import { sp } from '@pnp/sp';
import "@pnp/sp/webs";
import "@pnp/sp/folders";
import { HttpRequestError } from "@pnp/odata";
import { IFolder } from '@pnp/sp/folders';
import { ListViewCommandSetContext } from '@microsoft/sp-listview-extensibility';
import { Dialog, DialogType, DialogFooter, DefaultButton, PrimaryButton,
  IContextualMenuProps, getId, IStackTokens,
  KeyCodes, ITextFieldStyleProps, ITextFieldStyles, TooltipHost,
  Spinner, SpinnerSize, Icon, ITextFieldProps, Stack, IconButton,
  MessageBar, MessageBarType, Label, TextField, Toggle, Callout, DirectionalHint,
  OverflowSet, Separator, Coachmark, TeachingBubbleContent
} from '@fluentui/react';
import { useBoolean } from '@uifabric/react-hooks';
import { FolderStatus } from '../../../constants/FolderStatus';
import { TaskState } from '../../../constants/TaskState';
import ICustomItem from '../../../interfaces/ICustomItem';
import { Constants } from '../../../constants/Constants';
import FolderButton from './FolderButton';
import IProcessFolder from '../../../interfaces/IProcessFolder';
import * as strings from 'AddFoldersCommandSetStrings';
import styles from './FolderHierarchyGenerator.module.scss';

interface IFolderControllerProps {
  context: ListViewCommandSetContext;
  currentLocation: string;
  commandTitle: string;
  hideDialog: boolean;
  closeDialog: () => void;
}

const FolderController: React.FunctionComponent<IFolderControllerProps> = (props) => {
  type FolderDispatchAction =
  | { type: 'add'; value: any }
  | { type: 'remove'; value: any }
  | { type: 'replace'; value: any }
  | { type: 'reset'; }

  const _errorInfoId: string = getId('errorInfo');
  const _folderTextFieldId: string = getId('folderTextField');
  const _localStorageCoachmark: string = 'react-list-addfolders-coachmark';

  const [isCoachmarkVisible, { setFalse: hideCoachmark, setTrue: showCoachmark }] = useBoolean(false);
  const [batchFolders, setBatchFolders] = useState([]);
  const [folderNameRegExInfo, {setFalse: hideFolderNameRegExInfo, setTrue: showFolderNameRegExInfo}] = useBoolean(false);
  const [folderNameIsValid, setFolderNameIsValid] = useState(true);
  const [taskStatus, setTaskStatus] = useState(TaskState.none);
  const [folderName, setFolderName] = useState('');
  const [folderLengthWarn, setFolderLengthWarn] = useState(false);
  const [parallelFoldersWarn, setParallelFoldersWarn] = useState(false);
  const [nestedFolders, setNestedFolders] = useState(true);
  const [folders, dispatchFolders] = useReducer((fldrs, action: FolderDispatchAction) => {
    switch (action.type) {
      case "add":
        return [...fldrs, action.value];
      case "remove":
        return fldrs.filter(_ => _ !== action.value);
      case "replace":
        return action.value;
      case "reset":
        return [];
      default:
        throw new Error();
    }
  }, [] as ICustomItem[]);

  useEffect(() => {
    if (!window.localStorage.getItem(_localStorageCoachmark)) {
      showCoachmark();
    }

    return () => {
      dispatchFolders({type: "reset"});
    }
  }, [])

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

  async function _addFolders(foldersToAdd: IProcessFolder[]) {
    let currentFolderRelativeUrl = props.currentLocation;
    let batchAddFolders = null;
    let newFolder: IFolder;

    if (!nestedFolders) {
      batchAddFolders = sp.web.createBatch();
    }

    setBatchFolders([] as IProcessFolder[]);

    try {
      for (let fol of foldersToAdd) {
        if (nestedFolders) {
          try {
            if (currentFolderRelativeUrl) {
              newFolder = await sp.web.getFolderByServerRelativePath("!@p1::" + currentFolderRelativeUrl).addSubFolderUsingPath(fol.value);
              currentFolderRelativeUrl = await newFolder.serverRelativeUrl.get();
              setBatchFolders(oldBatchFolders => [...oldBatchFolders, { key: fol.key, value: fol.value, created: true }]);
            }
            else {
              throw new Error("Current folder URL is empty");
            }
          } catch (nestedError) {
            if(await raiseException(nestedError)) {
              console.error(`Error during the creation of the folder [${fol.value}]`);
              setBatchFolders(oldBatchFolders => [...oldBatchFolders, { key: fol.key, value: fol.value, created: false }]);

              throw nestedError;
            }
            else {
              currentFolderRelativeUrl += "/" + fol.value;
              setBatchFolders(oldBatchFolders => [...oldBatchFolders, { key: fol.key, value: fol.value, created: true }]);
            }
          }
        }
        else {
          sp.web.getFolderByServerRelativePath("!@p1::" + currentFolderRelativeUrl).inBatch(batchAddFolders).addSubFolderUsingPath(fol.value)
          .then(_ => {
            console.log(`Folder [${fol.value}] created`);
            setBatchFolders(oldBatchFolders => [...oldBatchFolders, { key: fol.key, value: fol.value, created: true }]);
          })
          .catch(async(nestedError: HttpRequestError) => {
            if(await raiseException(nestedError)) {
              console.error(`Error during the creation of the folder [${fol.value}]`);
              setBatchFolders(oldBatchFolders => [...oldBatchFolders, { key: fol.key, value: fol.value, created: false }]);

              throw nestedError;
            }
            else {
              currentFolderRelativeUrl += "/" + fol.value;
              setBatchFolders(oldBatchFolders => [...oldBatchFolders, { key: fol.key, value: fol.value, created: true }]);
            }
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

  async function raiseException(nestedError: HttpRequestError): Promise<boolean> {
    let raiseError: boolean = true;
    return new Promise<boolean>(async(resolve, reject) => {
      if (nestedError.isHttpRequestError) {
        try {
          const errorJson = await (nestedError).response.json();
          console.error(typeof errorJson["odata.error"] === "object" ? errorJson["odata.error"].message.value : nestedError.message);

          if (nestedError.status === 500) {
            // Don't raise an error if the folder already exists
            if (nestedError.message.indexOf('exist') > 0) {
              raiseError = false;
            }

            console.error(nestedError.statusText);
          }
        } catch (error) {
          console.error(error);
        }

      } else {
        console.log(nestedError.message);
      }

      resolve(raiseError);
    })
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

  function selectFolderClick(ev: React.MouseEvent<any, MouseEvent>, selectedFolder: ICustomItem) {
    if (taskStatus !== TaskState.progress) {
      if (selectedFolder.status === FolderStatus.created) {
        let newLocation: string = props.currentLocation;
        if (nestedFolders) {
          for (let folder of folders) {
            newLocation += "/" + folder.value;

            if (folder.key === selectedFolder.key) {
              break;
            }
          }
        }
        else {
          newLocation += "/" + selectedFolder.value;
        }

        if ('URLSearchParams' in window) {
          let searchParams: URLSearchParams = new URLSearchParams(window.location.search)

          if (searchParams.has('id')) {
            searchParams.set('id', decodeURIComponent(newLocation));
          }
          else {
            searchParams.append('id', decodeURIComponent(newLocation));
          }

          window.location.search = searchParams.toString();
        }
      }
      else {
        dispatchFolders({type: "remove", value: selectedFolder});
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
    }) as IProcessFolder[];

    _addFolders(_folds);
  }

  function eraseFoldersClick() {
    dispatchFolders({type: "reset"});
    setTaskStatus(TaskState.none);
  }

  function retryFailedFoldersClick() {
    setTaskStatus(TaskState.progress);

    let _folders = folders.map((fol) => {
      if (fol.status === FolderStatus.failed) {
        fol.status = FolderStatus.none;
      }

      return fol;
    });

    dispatchFolders({type: "replace", value: _folders});

    _addFolders(_folders);
  }

  function changeFolderCreationDirectionClick(event: React.MouseEvent<HTMLElement>, checked?: boolean) {
    setNestedFolders(checked);
  }

  function teachingBubbleButtonClick() {
    window.localStorage.setItem(_localStorageCoachmark, 'hide');
    hideCoachmark();
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
        const isLibraryContext = props.currentLocation.split('/').length === 2 && props.currentLocation.indexOf('/Lists/') < 0;
        const isListContext = props.currentLocation.split('/').length === 3 && props.currentLocation.indexOf('/Lists/') >= 0;

        // Reject if folder name submitted is "forms" if current location is root folder (library only)
        // Reject if folder name submitted is "attachments" if current location is root folder (list only)
        matchFolderName =
          (isLibraryContext && txtProps.value.match(Constants.folderNameRootLibraryRegEx) || isListContext && txtProps.value.match(Constants.folderNameRootListRegEx))
          || null;
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
                onClick={showFolderNameRegExInfo}
                className={styles.foldererror}
              />
            }
          </div>
        </Stack>
      </>);
  }

  function renderCustomBreadcrumb(item: ICustomItem, itemIndex: number) {
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
      <>
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
        {itemIndex !== folders.length - 1 &&
          <Icon iconName="ChevronRight" className={styles['folder-separator']} />
        }
      </>
    );
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

  function closeDialog(ev?: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (taskStatus === TaskState.progress) {
      // Prevent pop-up from closing during the creation process
      return;
    }

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
        title: props.commandTitle
      }}

      modalProps={{
        isBlocking: true,
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
          <Label className={styles.location}>{`${strings.LabelCurrentLocation} ${props.currentLocation.replace('/Lists', '')}`}</Label>
          <Stack horizontal verticalAlign="end" tokens={foldersStackTokens}>
            <TooltipHost content={strings.TextFieldDescription}>
              <TextField
                id={_folderTextFieldId}
                label={strings.TextFieldLabel}
                styles={getTextFieldStyles}
                onRenderLabel={folderNameErrorMessage}
                value={folderName}
                onKeyDown={folderTextFieldKeyDown}
                onChange={folderTextFieldChange}
                disabled={taskStatus === TaskState.progress || taskStatus === TaskState.done && folders.filter(fol => fol.status === FolderStatus.failed).length === 0}
                autoComplete='off'
                maxLength={255} />
            </TooltipHost>
            <TooltipHost
              content={strings.TooltipFolderAdd}>
              <IconButton onClick={addFolderToHierarchy} iconProps={{iconName: "NewFolder"}} disabled={!folderNameIsValid || folderName == ''} />
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
              onDismiss={hideFolderNameRegExInfo}
              role="alertdialog"
              directionalHint={DirectionalHint.bottomCenter}>
              <Stack tokens={calloutStackTokens} horizontalAlign='start' styles={{ root: { padding: 20 } }}>
                <span>{strings.CalloutBannedCharacters} <b>&laquo;</b> <b>*</b> <b>:</b> <b>&lt;</b> <b>&gt;</b> <b>?</b> <b>/</b> <b>\</b> <b>|</b></span>
                <span>{strings.CalloutBannedWords} <b>con</b>, <b>PRN</b>, <b>aux</b>, <b>nul</b>, <b>com0 - COM9</b>, <b>lpt0 - LPT9</b>, <b>_vti_</b></span>
                <span>{strings.CalloutBannedPrefixCharacters} <b>~</b> <b>$</b></span>
                <span>"<b>forms</b>" {strings.CalloutBannedFormsWordAtRoot}</span>
                <span>"<b>attachments</b>" {strings.CalloutBannedAttachmentsWordAtRoot}</span>
                <span>{strings.CalloutBannedCharactersUrlInfo} <a target='_blank' href={strings.CalloutBannedCharactersUrl}>{strings.CalloutBannedCharactersUrlLink}</a></span>
                <DefaultButton onClick={hideFolderNameRegExInfo} text={strings.ButtonGlobalClose} />
              </Stack>
            </Callout>
          }
          {isCoachmarkVisible && (
            <Coachmark
              target={'#' + _folderTextFieldId}
              positioningContainerProps={{
                directionalHint: DirectionalHint.topRightEdge,
                doNotLayer: false,
              }}
            >
              <TeachingBubbleContent
                headline={strings.TeachingBubbleHeadline}
                hasCloseButton
                primaryButtonProps={{
                  text: strings.TeachingBubblePrimaryButton,
                  onClick: teachingBubbleButtonClick
                }}
                onDismiss={hideCoachmark}
              >
                {strings.CoachmarkTutorial} <Icon iconName="NewFolder" />
              </TeachingBubbleContent>
            </Coachmark>
          )}
          <Separator />
          <div className={styles.folderscontainer}>
            {nestedFolders ?
              <Stack horizontal wrap className={styles['folders-brdcrmb']}>
                {folders.map((item, itemIndex) => {
                  return renderCustomBreadcrumb(item, itemIndex);
                })}
              </Stack>
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
