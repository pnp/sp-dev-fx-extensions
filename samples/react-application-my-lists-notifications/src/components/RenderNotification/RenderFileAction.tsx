import * as React from 'react';
import { useMemo } from 'react';

import strings from 'MyListsNotificationsApplicationCustomizerStrings';

import {
  Link,
  Text,
} from '@fluentui/react';
import { DriveItem } from '@microsoft/microsoft-graph-types';
import { Guid } from '@microsoft/sp-core-library';

import { EActions } from '../../common/EActions';
import { Action } from '../../models/IActivities';
import { getShortName } from '../../utils/utils';
import { useRenderNotificationStyles } from './useRenderNotificationStyles';

export interface IRenderActionFileProps {
  action: Action;
  item: DriveItem;
}

export const RenderFileAction: React.FunctionComponent<IRenderActionFileProps> = (
  props: React.PropsWithChildren<IRenderActionFileProps>
) => {
  const { action, item } = props;
  const { configurationListClasses} = useRenderNotificationStyles();

const RenderDefaultAction = useMemo((): JSX.Element => {
  if (!action.create) return null;
  const displayFileName = getShortName(item?.name);
  return (
    <div key={Guid.newGuid().toString()} className={configurationListClasses.divContainer}>
      <Text variant={"smallPlus"}> changed </Text>
      <Link
       title={item?.name}
        key={Guid.newGuid().toString()}
        style={{ fontWeight: 700 }}
        href={item.webUrl}
        target="_blank"
        data-interception="off"
      >
        {displayFileName}
      </Link>
    </div>
  );
}, [action, item]);

  const renderCreateAction = useMemo((): JSX.Element => {
    if (!action.create) return null;
    const displayCreatedFile = getShortName(item?.name);
    return (
      <div key={Guid.newGuid().toString()} className={configurationListClasses.divContainer}>
        <Text variant={"smallPlus"}>{strings.CreatedActionLabel}</Text>
        <Link
          title={item?.name}
          key={Guid.newGuid().toString()}
          style={{ fontWeight: 700 }}
          href={item.webUrl}
          target="_blank"
          data-interception="off"
        >
          {displayCreatedFile}
        </Link>
      </div>
    );
  }, [action, item]);

  const renderEditAction = useMemo((): JSX.Element => {
    if (!action.edit) return null;
    const displayEditFile = getShortName(item?.name);
    return (
      <div key={Guid.newGuid().toString()} className={configurationListClasses.divContainer}>
        <Text variant={"smallPlus"}> edited </Text>
        <Link
          title={item?.name}
          key={Guid.newGuid().toString()}
          style={{ fontWeight: 700 }}
          href={item.webUrl}
          target="_blank"
          data-interception="off"
        >
          {displayEditFile}
        </Link>
      </div>
    );
  }, [action, item]);

  const renderRenameAction = useMemo((): JSX.Element => {
    if (!action.rename) return null;
    const displayOldFileName = getShortName(action?.rename?.oldName);
    const displayNewFileName = getShortName(item?.name);

    return (
      <div key={Guid.newGuid().toString()} className={configurationListClasses.divContainer}>
        <Text variant={"smallPlus"}> Renamed </Text>
        <Link
         title={action?.rename?.oldName}
          key={Guid.newGuid().toString()}
          style={{ fontWeight: 700 }}
          href={item.webUrl}
          target="_blank"
          data-interception="off"
        >
          {displayOldFileName}
        </Link>
        <Text variant={"smallPlus"}> to </Text>
        <Link
         title={item?.name}
          key={Guid.newGuid().toString()}
          style={{ fontWeight: 700 }}
          href={item.webUrl}
          target="_blank"
          data-interception="off"
        >
          {displayNewFileName}
        </Link>
      </div>
    );
  }, [action, item]);

  const renderDeleteAction = useMemo((): JSX.Element => {
    if (!action.delete) return null;
    const displayDeletedFileName = getShortName(action?.delete.name);
    return (
      <div key={Guid.newGuid().toString()} className={configurationListClasses.divContainer}>
        <Text variant={"smallPlus"} style={{ fontWeight: 600 }}>
          deleted{" "}
        </Text>
        <Text variant={"smallPlus"} style={{ fontWeight: 600 }}>
          {displayDeletedFileName}
        </Text>
        {item && (
          <div>
            <Text variant={"smallPlus"} >
              {strings.fromFolderTextLabel}{" "}
            </Text>
            <Link
              title={item?.name}
              key={Guid.newGuid().toString()}
              style={{ fontWeight: 700 }}
              href={item?.webUrl}
              target="_blank"
              data-interception="off"
            >
              {item?.name}
            </Link>
          </div>
        )}
      </div>
    );
  }, [action, item]);


  const renderRestoreAction = useMemo((): JSX.Element => {
    // TODO to implement
    if (!action.restore) return null;
    return (
      <div key={Guid.newGuid().toString()}>
      </div>
    );
  }, [action, item]);


  const renderCommentAction = useMemo((): JSX.Element => {
    if (!action.comment) return null;
    const displayCommentFileName = getShortName(item?.name);
    return (
      <div key={Guid.newGuid().toString()} className={configurationListClasses.divContainer}>
        <Text variant={"smallPlus"} style={{ fontWeight: 600 }}>
          {strings.AddedCommentText}
        </Text>
        <Link
        title={item?.name}
              key={Guid.newGuid().toString()}
              style={{ fontWeight: 700 }}
              href={item?.webUrl}
              target="_blank"
              data-interception="off"
            >
               {displayCommentFileName}
            </Link>
      </div>
    );
  }, [action, item]);

  const renderShareAction = useMemo((): JSX.Element => {
    if (!action.share) return null;
    const displaySharedFileName = getShortName(item?.name);
    return (
      <div key={Guid.newGuid().toString()} className={configurationListClasses.divContainer}>
        <Text variant={"smallPlus"} style={{ fontWeight: 600 }}>
         {strings.sharedTextLabel}
        </Text>
        <Link
         title={item?.name}
              key={Guid.newGuid().toString()}
              style={{ fontWeight: 700 }}
              href={item?.webUrl}
              target="_blank"
              data-interception="off"
            >
               {displaySharedFileName}
            </Link>
        <Text variant={"smallPlus"} style={{ fontWeight: 600 }}>
         with <span style={{fontWeight: 700}}>{action.share.recipients.length}</span> recipients
        </Text>
      </div>
    );
  }, [action, item]);

  const renderVersionAction = useMemo((): JSX.Element => {

    if (!action.version) return null;
    const displayVersionFileName = getShortName(item?.name);
    return (
      <div key={Guid.newGuid().toString()} className={configurationListClasses.divContainer}>
        <Text variant={"smallPlus"} style={{ fontWeight: 600 }}>
          {strings.addedNewVersionText} <span style={{fontWeight: 700}}>{action.version.newVersion}</span>
        </Text>
        <Link
         title={item?.name}
              key={Guid.newGuid().toString()}
              style={{ fontWeight: 700 }}
              href={item?.webUrl}
              target="_blank"
              data-interception="off"
            >
              {displayVersionFileName}
            </Link>

        {item && (
          <div>
            <Text variant={"smallPlus"} style={{ fontWeight: 600 }}>
             {strings.inText}
            </Text>
            <Link
              key={Guid.newGuid().toString()}
              style={{ fontWeight: 700 }}
              href={item?.webUrl}
              target="_blank"
              data-interception="off"
            >
              {item?.name}
            </Link>
          </div>
        )}
      </div>
    );

  }, [action, item]);


  const actionKey = Object.keys(action)[0];
  switch (actionKey) {
    case EActions.create:
      return renderCreateAction;
      case EActions.edit:
      return renderEditAction;
    case EActions.delete:
      return renderDeleteAction;
    case EActions.rename:
      return renderRenameAction;
    case EActions.restore:
      return  renderRestoreAction;
    case EActions.comment:
      return renderCommentAction;
    case EActions.share:
      return renderShareAction;
    case EActions.version:
      return renderVersionAction;
    default:
      return RenderDefaultAction;
  }
};
