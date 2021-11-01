import * as React from 'react';
import { useMemo } from 'react';

import strings from 'MyListsNotificationsApplicationCustomizerStrings';

import {
  Link,
  Text,
} from '@fluentui/react';
import { ListItem } from '@microsoft/microsoft-graph-types';
import { Guid } from '@microsoft/sp-core-library';

import { EActions } from '../../common/EActions';
import { Action } from '../../models/IActivities';
import { useRenderNotificationStyles } from './useRenderNotificationStyles';

export interface IRenderActionItemProps {
  action: Action;
  item: ListItem;
}

export const RenderItemAction: React.FunctionComponent<IRenderActionItemProps> = (
  props: React.PropsWithChildren<IRenderActionItemProps>
) => {
  const { action, item } = props;
  const { Title, id } = (props.item?.fields as any) || {};
  const itemDispFormUrl: string = props?.item?.webUrl.replace(`${id}_.000`, `dispForm.aspx?ID=${id}`);
  const { configurationListClasses} = useRenderNotificationStyles();
  const RenderDefaultAction = useMemo((): JSX.Element => {
    if (!action.create) return null;
    const displayItemName = Title;
    return (
      <div key={Guid.newGuid().toString()}>
        <Text variant={"smallPlus"}> changed </Text>
        <Link
          title={Title}
          key={Guid.newGuid().toString()}
          style={{ fontWeight: 700 }}
          href={itemDispFormUrl}
          target="_blank"
          data-interception="off"
        >
          {displayItemName}
        </Link>
      </div>
    );
  }, [action, item]);

  const renderCreateAction = useMemo((): JSX.Element => {
    if (!action.create) return null;
    const displayCreatedItem = Title;
    return (
      <div key={Guid.newGuid().toString()} className={configurationListClasses.divContainer}>
        <Text variant={"smallPlus"}>{strings.CreatedActionLabel}</Text>
        <Link
          title={Title}
          key={Guid.newGuid().toString()}
          style={{ fontWeight: 700 }}
          href={itemDispFormUrl}
          target="_blank"
          data-interception="off"
        >
          {displayCreatedItem}
        </Link>
      </div>
    );
  }, [action, item]);

  const renderEditAction = useMemo((): JSX.Element => {
    if (!action.edit) return null;
    const displayEditItem = Title;
    return (
      <div key={Guid.newGuid().toString()} className={configurationListClasses.divContainer}>
        <Text variant={"smallPlus"}> edited </Text>
        <Link
        title={Title}
          key={Guid.newGuid().toString()}
          style={{ fontWeight: 700 }}
          href={itemDispFormUrl}
          target="_blank"
          data-interception="off"
        >
          {displayEditItem}
        </Link>
      </div>
    );
  }, [action, item]);

  const renderDeleteAction = useMemo((): JSX.Element => {
    if (!action.delete) return null;
    const displayDeletedItemName = action?.delete.name.replace("_.000", "");
    return (
      <div key={Guid.newGuid().toString()} className={configurationListClasses.divContainer}>
        <Text variant={"smallPlus"} style={{ fontWeight: 600 }}>
          {strings.deleteMessageText}{" "}
        </Text>
        <Text variant={"smallPlus"} style={{ fontWeight: 600 }}>
          {displayDeletedItemName}
        </Text>
      </div>
    );
  }, [action, item]);

  const renderCommentAction = useMemo((): JSX.Element => {
    if (!action.comment) return null;
    const displayCommentItemName = Title;
    return (
      <div key={Guid.newGuid().toString()} className={configurationListClasses.divContainer}>
        <Text variant={"smallPlus"} style={{ fontWeight: 600 }}>
          {strings.AddedCommentText}
        </Text>
        <Link
        title={Title}
          key={Guid.newGuid().toString()}
          style={{ fontWeight: 700 }}
          href={itemDispFormUrl}
          target="_blank"
          data-interception="off"
        >
          {displayCommentItemName}
        </Link>
      </div>
    );
  }, [action, item]);

  const renderShareAction = useMemo((): JSX.Element => {
    if (!action.share) return null;
    const displaySharedItemName = Title;
    return (
      <div key={Guid.newGuid().toString()} className={configurationListClasses.divContainer}>
        <Text variant={"smallPlus"} style={{ fontWeight: 600 }}>
          {strings.sharedTextLabel}
        </Text>
        <Link
        title={Title}
          key={Guid.newGuid().toString()}
          style={{ fontWeight: 700 }}
          href={itemDispFormUrl}
          target="_blank"
          data-interception="off"
        >
          {displaySharedItemName}
        </Link>
        <Text variant={"smallPlus"} style={{ fontWeight: 600 }}>
          with <span style={{ fontWeight: 700 }}>{action.share.recipients.length}</span> recipients
        </Text>
      </div>
    );
  }, [action, item]);

  const renderVersionAction = useMemo((): JSX.Element => {
    if (!action.version) return null;
    const displayVersionItemName = Title;
    return (
      <div key={Guid.newGuid().toString()} className={configurationListClasses.divContainer}>
        <Text variant={"smallPlus"} style={{ fontWeight: 600 }}>
          {" "}
          add new version <span style={{ fontWeight: 700 }}>{action.version.newVersion}</span>
        </Text>
        <Link
          key={Guid.newGuid().toString()}
          style={{ fontWeight: 700 }}
          href={itemDispFormUrl}
          target="_blank"
          data-interception="off"
        >
          {displayVersionItemName}
        </Link>

        {item && (
          <div>
            <Text variant={"smallPlus"} style={{ fontWeight: 600 }}>
              {" "}
              in
            </Text>
            <Link
              key={Guid.newGuid().toString()}
              style={{ fontWeight: 700 }}
              href={itemDispFormUrl}
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
    case EActions.comment:
      return renderCommentAction;
    case EActions.share:
      return renderShareAction;
    default:
      return RenderDefaultAction;
  }
};
