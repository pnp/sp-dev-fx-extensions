import * as React from 'react';
import { memo } from 'react';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { Icon } from '@fluentui/react/lib/Icon';
import { IconButton } from '@fluentui/react/lib/Button';
import { Checkbox } from '@fluentui/react/lib/Checkbox';
import { Text } from '@fluentui/react/lib/Text';
import { Stack } from '@fluentui/react/lib/Stack';
import { LinkBadge } from './LinkBadge';
import { IBulkSelectionHook } from '../../hooks/useBulkSelection';
import styles from './LinkList.module.scss';

export interface ILinkListProps {
  links: IContextualMenuItem[];
  onLinksChange?: (links: IContextualMenuItem[]) => void;
  allLinks?: IContextualMenuItem[];
  bulkSelection?: IBulkSelectionHook;
  showBulkSelection?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowReorder?: boolean;
  onEditLink?: (link: IContextualMenuItem) => void;
  onDeleteLink?: (linkKey: string) => void;
  onLinkClick?: (link: IContextualMenuItem, event?: React.MouseEvent<any>) => void;
  emptyMessage?: string;
  itemHeight?: 'compact' | 'normal' | 'large';
  showDetails?: boolean;
  maxHeight?: string;
}

interface IEnhancedContextualMenuItem extends IContextualMenuItem {
  badge?: 'new' | 'updated' | 'popular' | 'urgent';
  lastUpdated?: Date;
  clickCount?: number;
}

export const LinkList: React.FC<ILinkListProps> = ({
  links,
  onLinksChange,
  allLinks,
  bulkSelection,
  showBulkSelection = false,
  allowEdit = false,
  allowDelete = false,
  allowReorder = false,
  onEditLink,
  onDeleteLink,
  onLinkClick,
  emptyMessage = "No links found",
  itemHeight = 'normal',
  showDetails = true,
  maxHeight = '400px'
}) => {
  const handleLinkClick = (link: IContextualMenuItem, event?: React.MouseEvent<any>) => {
    if (onLinkClick) {
      onLinkClick(link, event);
    } else if (link.href) {
      window.open(link.href, '_blank', 'noopener,noreferrer');
    }
  };

  const handleEditClick = (link: IContextualMenuItem, event: React.MouseEvent<any>) => {
    event.stopPropagation();
    if (onEditLink) {
      onEditLink(link);
    }
  };

  const handleDeleteClick = (linkKey: string, event: React.MouseEvent<any>) => {
    event.stopPropagation();
    if (onDeleteLink) {
      onDeleteLink(linkKey);
    } else if (onLinksChange && allLinks) {
      const updatedLinks = allLinks.filter(link => link.key !== linkKey);
      onLinksChange(updatedLinks);
    }
  };

  const handleSelectionChange = (linkKey: string, checked: boolean | undefined) => {
    if (bulkSelection) {
      bulkSelection.toggleItemSelection(linkKey);
    }
  };

  const getLinkIcon = (link: IContextualMenuItem): string => {
    // Check for custom icon in data
    if (link.data?.iconName) {
      return link.data.iconName;
    }
    // Check for standard iconProps
    if (link.iconProps?.iconName) {
      return link.iconProps.iconName;
    }
    // Default fallback
    return 'Link';
  };

  const getLinkCategory = (link: IContextualMenuItem): string => {
    return link.data?.category || 'General';
  };

  const getLinkDescription = (link: IContextualMenuItem): string => {
    return link.data?.description || link.title || '';
  };

  const getLastUsed = (link: IContextualMenuItem): string => {
    const lastUsed = link.data?.lastUsed;
    if (!lastUsed) return '';
    
    const date = new Date(lastUsed);
    return date.toLocaleDateString();
  };

  if (links.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Icon iconName="DocumentSearch" className={styles.emptyIcon} />
        <Text variant="mediumPlus" className={styles.emptyMessage}>
          {emptyMessage}
        </Text>
      </div>
    );
  }

  return (
    <div className={styles.linkList} style={{ maxHeight }}>
      {links.map((link, index) => {
        const enhancedLink = link as IEnhancedContextualMenuItem;
        // Ensure unique key by using multiple fallback strategies
        const linkKey = link.key || 
                       `${link.data?.id || ''}${link.name || ''}${link.href || ''}${index}`.replace(/\s+/g, '_') ||
                       `fallback_${Date.now()}_${index}`;
        const isSelected = bulkSelection?.isItemSelected(linkKey) || false;

        return (
          <div
            key={linkKey}
            className={`${styles.linkItem} ${itemHeight === 'compact' ? styles.compact : itemHeight === 'large' ? styles.large : ''} ${isSelected ? styles.selected : ''}`}
            onClick={(e) => !showBulkSelection && handleLinkClick(link, e)}
          >
            {/* Selection Checkbox */}
            {showBulkSelection && bulkSelection && (
              <div className={styles.selectionColumn}>
                <Checkbox
                  checked={isSelected}
                  onChange={(_, checked) => handleSelectionChange(linkKey, checked || false)}
                  ariaLabel={`Select ${link.name}`}
                />
              </div>
            )}

            {/* Icon */}
            <div className={styles.iconColumn}>
              <div className={styles.iconContainer}>
                <Icon
                  iconName={getLinkIcon(link)}
                  className={styles.linkIcon}
                />
                {enhancedLink.badge && (
                  <LinkBadge type={enhancedLink.badge} />
                )}
              </div>
            </div>

            {/* Content */}
            <div className={styles.contentColumn}>
              <div className={styles.linkHeader}>
                <Text variant="medium" className={styles.linkTitle}>
                  {link.name}
                </Text>
                <div className={styles.linkMeta}>
                  <Text variant="small" className={styles.linkCategory}>
                    {getLinkCategory(link)}
                  </Text>
                  {(link.data as any)?.isMandatory && (
                    <span className={styles.mandatoryBadge}>Mandatory</span>
                  )}
                  {getLastUsed(link) && (
                    <Text variant="small" className={styles.lastUsed}>
                      Used {getLastUsed(link)}
                    </Text>
                  )}
                </div>
              </div>
              
              {showDetails && getLinkDescription(link) && (
                <Text variant="small" className={styles.linkDescription}>
                  {getLinkDescription(link)}
                </Text>
              )}
              
              {showDetails && link.href && (
                <Text variant="small" className={styles.linkUrl}>
                  {link.href}
                </Text>
              )}
            </div>

            {/* Actions */}
            <div className={styles.actionsColumn}>
              <Stack horizontal tokens={{ childrenGap: 4 }}>
                {!showBulkSelection && (
                  <IconButton
                    iconProps={{ iconName: 'NavigateExternalInline' }}
                    title="Open link"
                    onClick={(e) => handleLinkClick(link, e)}
                    className={styles.actionButton}
                  />
                )}
                
                {allowEdit && (
                  <IconButton
                    iconProps={{ iconName: 'Edit' }}
                    title="Edit link"
                    onClick={(e) => handleEditClick(link, e)}
                    className={styles.actionButton}
                  />
                )}
                
                {allowDelete && (
                  <IconButton
                    iconProps={{ iconName: 'Delete' }}
                    title="Delete link"
                    onClick={(e) => handleDeleteClick(linkKey, e)}
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                  />
                )}
                
                {allowReorder && (
                  <IconButton
                    iconProps={{ iconName: 'GripperDotsVertical' }}
                    title="Reorder"
                    className={styles.actionButton}
                  />
                )}
              </Stack>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default memo(LinkList);