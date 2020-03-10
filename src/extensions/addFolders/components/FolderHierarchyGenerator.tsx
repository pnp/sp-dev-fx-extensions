import * as React from 'react';
import styles from './FolderHierarchyGenerator.module.scss';
import { IFolderHierarchyGeneratorProps } from './IFolderHierarchyGeneratorProps';
import { Breadcrumb, TextField, IBreadcrumbItem, DefaultButton, KeyCodes, TooltipHost,
  MessageBar, MessageBarType, BaseButton, Button, OverflowSet, IBreadCrumbData, Toggle,
  IButtonProps, Spinner, SpinnerSize, Icon, IContextualMenuProps, ITextFieldProps, Stack,
  IconButton, Callout, IStackTokens, DirectionalHint, getId, ITextFieldStyleProps,
  ITextFieldStyles, IOverflowSetItemProps, PrimaryButton } from 'office-ui-fabric-react';
import { useState, useEffect } from 'react';
import IFolder from '../../../interfaces/IFolder';
import { FolderStatus } from '../../../constants/FolderStatus';
import FolderButton  from './FolderButton';
import { Constants } from '../../../constants/Constants';
import * as strings from 'AddFoldersCommandSetStrings';

interface ICustomBreadcrumbItem extends IBreadcrumbItem, IOverflowSetItemProps {
  status: FolderStatus;
  hidden: boolean;
  value: string;
}

enum TaskState {
  none,
  progress,
  done
}

const FolderHierarchyGenerator: React.FunctionComponent<IFolderHierarchyGeneratorProps> = (props) => {
  let _iconButtonId: string = getId('iconButton');

  const [folderNameRegExInfo, setFolderNameRegExInfo] = useState(false);
  const [folderNameIsValid, setFolderNameIsValid] = useState(true);
  const [taskStatus, _setTaskStatus] = useState(TaskState.none);
  const [folders, _setFolders] = useState([] as ICustomBreadcrumbItem[]);
  const [overflowFolders, _setOverflowFolders] = useState([] as IBreadcrumbItem[]);
  const [folderName, setFolderName] = useState('');
  const [folderLengthWarn, setFolderLengthWarn] = useState(false);
  const [parallelFoldersWarn, setParallelFoldersWarn] = useState(false);
  const [nestedFolders, _setNestedFolders] = useState(true);

  const foldersRef = React.useRef(folders);
  const overflowFoldersRef = React.useRef(overflowFolders);
  const taskStatusRef = React.useRef(taskStatus);
  const nestedFoldersRef = React.useRef(nestedFolders);

  const setFolders = f => {
    foldersRef.current = f;
    _setFolders(f);
  };

  const setOverflowFolders = f => {
    overflowFoldersRef.current = f;
    _setOverflowFolders(f);
  };

  const setTaskStatus = f => {
    taskStatusRef.current = f;
    _setTaskStatus(f);
  };

  const setNestedFolders = f => {
    nestedFoldersRef.current = f;
    _setNestedFolders(f);
  };

  useEffect(() => {
    let keepLoading:boolean = true;

    if (props.batchStatus.length > 0 && foldersRef.current.length > 0) {
      let _folders = foldersRef.current.slice();

      let lastTask = props.batchStatus[props.batchStatus.length-1];
      let _folderToUpdate = _folders.filter(_fol => _fol.key === lastTask.key)[0];
      let indexFolderToUpdate = _folders.indexOf(_folderToUpdate);

      if (lastTask.created) {
        _folders[indexFolderToUpdate].status = FolderStatus.created;
        keepLoading = _folders.filter(fol => fol.status === FolderStatus.none).length > 0;
      }
      else {
        if (nestedFoldersRef.current) {
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

      setFolders(_folders);

      if (keepLoading) {
        setTaskStatus(TaskState.progress);
      }
      else {
        setTaskStatus(TaskState.done);
      }
    }

  }, [props.batchStatus]);

  const folderMenuProps: IContextualMenuProps = {
    items: [
      {
        key: 'retryFailedTasks',
        text: strings.FolderMenuRetry,
        onClick: retryFailedFoldersClick
      }
    ]
  };

  const calloutStackTokens: IStackTokens = {
    childrenGap: 20,
    maxWidth: 400
  };

  const foldersStackTokens: IStackTokens = {
    childrenGap: 20,
    padding: 10
  };

  const btnCreateFoldersDisabled =
    taskStatusRef.current === TaskState.progress
    || folderLengthWarn
    || parallelFoldersWarn
    || foldersRef.current.length === 0;

  function isTotalUrlTooLong() {
    let _foldersPath = '';
    let isUrlTooLong: boolean = false;

    if (nestedFoldersRef.current) {
      foldersRef.current.forEach((fol, i) => {
        _foldersPath += fol.value + (i < foldersRef.current.length - 1 ? '/' : '');
      });

      isUrlTooLong = props.context.pageContext.web.absoluteUrl.length + _foldersPath.length >= Constants.maxTotalUrlLength;
    }
    else {
      isUrlTooLong = foldersRef.current.some((fol) => props.context.pageContext.web.absoluteUrl.length + ('/' + fol.value).length >= Constants.maxTotalUrlLength);
    }

    return isUrlTooLong;
  }

  function addFolderToHierarchy() {
    if (folderName.trim() != '' && folderNameIsValid) {
      let _folders = foldersRef.current.slice();

      _folders.push(
        {
          key: folderName + '_' + Math.random().toString(36).substr(2, 9),
          text: folderName,
          onClick: selectFolderClick,
          status: FolderStatus.none,
          hidden: false,
          value: folderName
        });

      setFolders(_folders);
      setFolderName('');

      setFolderLengthWarn(isTotalUrlTooLong());

      setParallelFoldersWarn(!nestedFoldersRef.current && _folders.length > Constants.maxParallelFolders);
    }
  }

  function displayedFoldersReduceData(foldersData: IBreadCrumbData) {
    let folderStatusText = '';
    let folderToHide = foldersData.renderedItems[0] as ICustomBreadcrumbItem;
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

  function selectFolderClick(ev: React.MouseEvent<HTMLElement | BaseButton | Button, MouseEvent>, folderToRemove: IBreadcrumbItem | IOverflowSetItemProps) {
    if (taskStatusRef.current !== TaskState.progress) {
      let _folders = foldersRef.current.filter(fol => fol != folderToRemove);

      if (_folders.length === 0 && taskStatusRef.current === TaskState.done) {
        eraseFoldersClick();
      }
      else {
        setFolders(_folders);
        setFolderLengthWarn(isTotalUrlTooLong());
        setParallelFoldersWarn(!nestedFoldersRef.current && _folders.length > Constants.maxParallelFolders);
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

    let _folds = foldersRef.current.map((fol) => {
      return {key: fol.key, value: fol.value};
    }) as IFolder[];

    props.handleAddFolder(_folds, nestedFoldersRef.current);
  }

  function eraseFoldersClick() {
    setFolders([]);
    setTaskStatus(TaskState.none);

    if (nestedFoldersRef.current) {
      setOverflowFolders([]);
    }

    setFolderLengthWarn(isTotalUrlTooLong());
  }

  function retryFailedFoldersClick() {
    setTaskStatus(TaskState.progress);

    let foldersToRetry = foldersRef.current.map((fol) => {
      return {key: fol.key, value: fol.value};
    }) as IFolder[];

    let _folders = foldersRef.current.map((fol) => {
      if (fol.status === FolderStatus.failed) {
        fol.status = FolderStatus.none;
      }

      return fol;
    });

    setFolders(_folders);

    props.handleAddFolder(foldersToRetry, nestedFoldersRef.current);
  }

  function errorInfoIconClick() {
    setFolderNameRegExInfo(true);
  }

  function errorInfoIconDismiss() {
    setFolderNameRegExInfo(false);
  }

  function changeFolderCreationDirectionClick(event: React.MouseEvent<HTMLElement>, checked?: boolean) {
    setNestedFolders(checked);
    setFolderLengthWarn(isTotalUrlTooLong());
  }

  function getTextFieldStyles(stylesProps: ITextFieldStyleProps): Partial<ITextFieldStyles> {
    let color = folderNameIsValid? stylesProps.theme.semanticColors.inputText : stylesProps.theme.semanticColors.errorText;
    let after = folderNameIsValid ? stylesProps.theme.semanticColors.inputBackgroundChecked : stylesProps.theme.semanticColors.errorText;

    return {
      fieldGroup: [
        {
          borderColor: color,
          selectors: {
            '&:hover': {
              borderColor: color
            }
          }
        },
        {
          selectors: {
            ':after': {
              borderColor: after
            }
          }
        }
      ]
    };
  }

  function onRenderItem(item: ICustomBreadcrumbItem) {
    let tooltipItem: string = strings.TooltipFolderDelete;
    let classIcon: string = '';
    let icon: string = '';
    let isInProgress: boolean = taskStatusRef.current === TaskState.progress && item.status === FolderStatus.none;

    switch (item.status) {
      case FolderStatus.created:
        classIcon=styles.addsuccess;
        icon='StatusCircleCheckmark';
        tooltipItem=strings.TooltipFolderStatusSuccess;
        break;

      case FolderStatus.failed:
        classIcon=styles.addfailure;
        icon='StatusCircleErrorX';
        tooltipItem=strings.TooltipFolderStatusFailure;
        break;
    }

    if (isInProgress) {
      tooltipItem=strings.TooltipFolderStatusProgress;
    }

    return (
      <TooltipHost content={tooltipItem}>
        <FolderButton onClick={(ev) => selectFolderClick(ev, item)} isNested={nestedFoldersRef.current}
        render={
          <>
            {`${item.value} `}
            {taskStatusRef.current === TaskState.none && item.status === FolderStatus.none &&
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

  function folderNameErrorMessage(txtProps: ITextFieldProps) {
    let matchFolderName: RegExpMatchArray = null;

    if (txtProps.value != '') {
      matchFolderName = txtProps.value.match(Constants.folderNameRegEx);

      // TODO : test if current location is root folder of library ("forms")
    }

    setFolderNameIsValid(matchFolderName === null || txtProps.value == '');

    return (
      <>
        <Stack horizontal verticalAlign="center" className={styles.labelerror}>
          <span>{txtProps.label}</span>
          <div>
            {matchFolderName !== null &&
              <IconButton
                id={_iconButtonId}
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

  function renderOverFlow(buttonProps: IButtonProps) {
    let hiddenFolders: ICustomBreadcrumbItem[] = foldersRef.current.filter(fol => fol.hidden);
    let totalHiddenFoldersHandled: number = hiddenFolders.filter(fol => fol.status !== FolderStatus.none).length;
    let totalHiddenFoldersSuccess: number = hiddenFolders.filter(fol => fol.status === FolderStatus.created).length;
    let totalHiddenFoldersFailed: number = hiddenFolders.filter(fol => fol.status === FolderStatus.failed).length;
    let overflowText: string = '...';

    let uploadOccurred: boolean = taskStatusRef.current !== TaskState.none && (totalHiddenFoldersSuccess > 0 || totalHiddenFoldersFailed > 0);

    if(taskStatusRef.current === TaskState.progress && totalHiddenFoldersHandled !== hiddenFolders.length
    || uploadOccurred) {
      overflowText =`${totalHiddenFoldersSuccess}/${hiddenFolders.length}`;
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

    let tooltipOverflowText: string = `${nbFoldersOverflowText} ${(taskStatusRef.current !== TaskState.done && !uploadOccurred ?
    strings.TooltipOverflowSuffixFoldersToCreate:
    strings.TooltipOverflowSuffixFoldersCreated)}`;

    return (
      <div>
        <TooltipHost content={`${tooltipOverflowText}`}>
          <DefaultButton className={styles.overflow}>
            {`${overflowText} `}
            {taskStatusRef.current === TaskState.progress && totalHiddenFoldersHandled !== hiddenFolders.length &&
              <Spinner className={styles.addoverflowloading} size={SpinnerSize.xSmall} />
            }
            {totalHiddenFoldersSuccess === hiddenFolders.length &&
              <Icon className={styles.addoverflowsuccess} iconName='StatusCircleCheckmark' />
            }
            {taskStatusRef.current === TaskState.done && hiddenFolders.filter(fol => fol.status === FolderStatus.failed).length > 0 &&
              <Icon className={styles.addoverflowwarning} iconName='StatusCircleExclamation' />
            }
          </DefaultButton>
        </TooltipHost>
      </div>
    );
  }

  return (
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
        <Stack horizontal verticalAlign="end" tokens={foldersStackTokens}>
          <TextField
            label={strings.TextFieldLabel}
            styles={getTextFieldStyles}
            onRenderLabel={folderNameErrorMessage}
            value={folderName}
            onKeyDown={folderTextFieldKeyDown}
            onChange={folderTextFieldChange}
            disabled={taskStatusRef.current === TaskState.progress}
            autoComplete='off' />
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
              onClick={createFoldersClick}
              disabled={btnCreateFoldersDisabled} />
          }
        </Stack>
        <Toggle
          defaultChecked={nestedFoldersRef.current}
          inlineLabel
          label={strings.ToggleSelectFoldersCreationMode}
          onChange={changeFolderCreationDirectionClick}
          disabled={taskStatusRef.current === TaskState.progress} />
        {folderNameRegExInfo &&
          <Callout
            target={'#' + _iconButtonId}
            setInitialFocus={true}
            onDismiss={errorInfoIconDismiss}
            role="alertdialog"
            directionalHint={DirectionalHint.bottomCenter}>
            <Stack tokens={calloutStackTokens} horizontalAlign='start' styles={{ root: { padding: 20 } }}>
              <span>{strings.CalloutBannedCharacters} <b>&laquo;</b> <b>*</b> <b>:</b> <b>&lt;</b> <b>&gt;</b> <b>?</b> <b>/</b> <b>\</b> <b>|</b></span>
              <span>{strings.CalloutBannedWords} <b>con</b>, <b>PRN</b>, <b>aux</b>, <b>nul</b>, <b>com0 - COM9</b>, <b>lpt0 - LPT9</b>, <b>_vti_</b></span>
              <span>{strings.CalloutBannedPrefixCharacters} <b>~</b> <b>$</b></span>
              <span>{strings.CalloutBannedCharactersUrl} <a target='_blank' href='https://support.office.com/en-us/article/invalid-file-names-and-file-types-in-onedrive-onedrive-for-business-and-sharepoint-64883a5d-228e-48f5-b3d2-eb39e07630fa'>{strings.CalloutBannedCharactersUrlLink}</a></span>
              <DefaultButton onClick={errorInfoIconDismiss} text={strings.ButtonGlobalClose} />
            </Stack>
          </Callout>
        }
        <div className={styles.folderscontainer}>
          {nestedFoldersRef.current ?
            <Breadcrumb items={foldersRef.current} onRenderOverflowIcon={renderOverFlow} onRenderItem={onRenderItem} onReduceData={displayedFoldersReduceData} />
            :
            <div className={styles.dialogContainer}>
              <OverflowSet
                vertical
                items={foldersRef.current}
                onRenderItem={onRenderItem}
                onRenderOverflowButton={null} />
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default FolderHierarchyGenerator;
