import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import styles from './CollabFooter.module.scss';

import { ICollabFooterEditResult, ICollabFooterProps } from './ICollabFooterProps';
import * as strings from 'CollaborationFooterApplicationCustomizerStrings';

import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { CommandBar, ICommandBarStyles } from '@fluentui/react/lib/CommandBar';
import { IContextualMenuItem, ContextualMenuItemType } from '@fluentui/react/lib/ContextualMenu';

const CollabFooter: React.FC<ICollabFooterProps> = ({ sharedLinks, myLinks: initialMyLinks, editMyLinks }) => {
  const [myLinks, setMyLinks] = useState<IContextualMenuItem[]>(initialMyLinks);
  const [myLinksSaved, setMyLinksSaved] = useState<boolean | null>(null);

  // Debugging: Log sharedLinks and myLinks to check structure
  useEffect(() => {
    console.log('Shared Links: ', sharedLinks);
    console.log('My Links: ', myLinks);
  }, [sharedLinks, myLinks]);

  // Update state when props change
  useEffect(() => {
    setMyLinks(initialMyLinks);
  }, [initialMyLinks]);

  // Edit MyLinks callback
  const handleEditMyLinks = useCallback(async () => {
    try {
      const editResult: ICollabFooterEditResult = await editMyLinks(); // Call the edit dialog

      if (editResult.editResult && editResult.myLinks) {
        // Map IMyLink[] to IContextualMenuItem[]
        const mappedMyLinks: IContextualMenuItem[] = editResult.myLinks.map(link => ({
          key: link.key,
          name: link.title,
          itemType: ContextualMenuItemType.Normal,
          href: link.url,
          subMenuProps: undefined, // No sub-menu for personal links
          isSubMenu: false, // Ensure this is false as personal links do not have sub-items
        }));
        setMyLinks(mappedMyLinks);
        setMyLinksSaved(true);  // Show success message
      } else {
        // Show failure message if editResult.editResult is false
        setMyLinksSaved(false);
      }

      // Clear saved status after 2 seconds
      setTimeout(() => setMyLinksSaved(null), 2000);
    } catch (error) {
      // Catch any errors and show failure message
      console.error('Error editing MyLinks:', error);
      setMyLinksSaved(false);
      setTimeout(() => setMyLinksSaved(null), 2000);
    }
  }, [editMyLinks]);

  // Prepare menu items dynamically
  const menuItems: IContextualMenuItem[] = React.useMemo(() => {
    let items: IContextualMenuItem[] = [...sharedLinks];

    // Log items for debugging purposes
    console.log("Menu Items: ", items);

    if (myLinks && myLinks.length > 0) {
      items.push({
        key: 'MyLinksRoot',
        name: strings.MyLinks,
        itemType: ContextualMenuItemType.Normal,
        iconProps: { iconName: 'Emoji2' }, // Use 'Emoji2' or any valid icon
        subMenuProps: {
          items: myLinks.map((link) => ({
            key: link.key, // Ensure unique keys
            name: link.name, // 'name' corresponds to the link's title
            href: link.href,
            itemType: ContextualMenuItemType.Normal,
            iconProps: link.iconProps, // Optional: Include icons if available
            subMenuProps: undefined,
            isSubMenu: false,
          })),
        },
        isSubMenu: false,  // Set isSubMenu to false as subMenuProps handles it
      });
    }

    return items;
  }, [sharedLinks, myLinks]);

  // Optional: Define styles for the CommandBar to ensure proper display
  const commandBarStyles: Partial<ICommandBarStyles> = {
    root: {
      width: '100%',
    },
  };

  return (
    <div className={styles.collabFooter}>
      <div className={styles.collabFooterContainer}>
        {myLinksSaved !== null && (
          <MessageBar
            messageBarType={myLinksSaved ? MessageBarType.success : MessageBarType.error}
            isMultiline={false}
          >
            {myLinksSaved ? strings.MyLinksSaveSuccess : strings.MyLinksSaveFailed}
          </MessageBar>
        )}
        <CommandBar
          className={styles.commandBar}
          items={menuItems} // Pass the dynamically generated menu items
          styles={commandBarStyles}
          farItems={[
            {
              key: 'editMyLinks',
              name: strings.EditMyLinks,
              itemType: ContextualMenuItemType.Normal,
              iconProps: { iconName: 'Edit' },
              onClick: () => {
                handleEditMyLinks();
                return false; // Prevent default behavior
              },
            },
          ]}
        />
      </div>
    </div>
  );
};

export default CollabFooter;
