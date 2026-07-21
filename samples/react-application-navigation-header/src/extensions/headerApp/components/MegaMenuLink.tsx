import * as React from 'react';
import { Open12Regular } from '@fluentui/react-icons';

import type { INavigationItem } from '../models/INavigationItem';
import type { IHeaderStrings } from '../models/IHeaderStrings';
import type { IActivePathContext } from '../utils/navigation';
import { classNames, itemHasChildren } from '../utils/navigation';
import styles from './DesktopNavigation.module.scss';

export interface IMegaMenuLinkProps {
  activeContext?: IActivePathContext;
  activeItemIds: Set<string>;
  currentPageItemId?: string;
  item: INavigationItem;
  onNavigate: (item: INavigationItem) => void;
  strings: IHeaderStrings;
}

const MegaMenuLink: React.FC<IMegaMenuLinkProps> = React.memo(({ activeContext: _activeContext, activeItemIds, currentPageItemId, item, onNavigate, strings }) => {
  const handleItemClick = React.useCallback((): void => {
    onNavigate(item);
  }, [item, onNavigate]);

  const currentPageLabel: string = strings.CurrentPageLabel || 'Current page';
  const currentSectionLabel: string = strings.CurrentSectionLabel || 'Current section';

  if (!item.url && item.children.length === 0 && !itemHasChildren(item)) {
    return null;
  }

  const isCurrentItem: boolean = currentPageItemId === item.id;
  const isContextItem: boolean = activeItemIds.has(item.id);
  const itemStateLabel: string | undefined = isCurrentItem
    ? currentPageLabel
    : isContextItem
      ? currentSectionLabel
      : undefined;

  const content = (
    <>
      <div className={styles.megaMenuLinkRow}>
        <span className={styles.megaMenuLinkRowMain}>
          <span className={styles.megaMenuLinkLabel}>{item.label}</span>
          {item.isExternal ? <Open12Regular className={styles.externalIcon} /> : null}
        </span>
        {itemStateLabel ? (
          <span
            className={classNames(
              styles.megaMenuCurrentBadge,
              isCurrentItem ? styles.megaMenuCurrentBadgeCurrent : undefined
            )}
          >
            {itemStateLabel}
          </span>
        ) : null}
      </div>
      {item.description ? <span className={styles.megaMenuLinkDescription}>{item.description}</span> : null}
    </>
  );

  return (
    <div className={styles.megaMenuLinkBlock}>
      {item.url ? (
        <a
          aria-current={isCurrentItem ? 'page' : undefined}
          className={classNames(
            styles.megaMenuLink,
            isContextItem ? styles.megaMenuLinkActive : undefined,
            isCurrentItem ? styles.megaMenuLinkCurrent : undefined
          )}
          href={item.url}
          onClick={handleItemClick}
          {...(item.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {content}
        </a>
      ) : (
        <div className={classNames(styles.megaMenuLinkStatic, isContextItem ? styles.megaMenuLinkActive : undefined)}>{content}</div>
      )}

      {item.children.length > 0 ? (
        <ul className={styles.megaMenuSubList}>
          {item.children.map((child: INavigationItem) => {
            const isCurrentChild: boolean = currentPageItemId === child.id;
            const isContextChild: boolean = activeItemIds.has(child.id);

            return (
              <li className={styles.megaMenuSubItem} key={child.id}>
                {child.url ? (
                  <a
                    aria-current={isCurrentChild ? 'page' : undefined}
                    className={classNames(
                      styles.megaMenuSubLink,
                      isContextChild ? styles.megaMenuSubLinkActive : undefined,
                      isCurrentChild ? styles.megaMenuSubLinkCurrent : undefined
                    )}
                    href={child.url}
                    onClick={(): void => onNavigate(child)}
                    {...(child.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <span>{child.label}</span>
                    <span className={styles.megaMenuSubLinkMeta}>
                      {child.isExternal ? <Open12Regular className={styles.externalIcon} /> : null}
                      {isCurrentChild ? (
                        <span className={classNames(styles.megaMenuCurrentBadge, styles.megaMenuCurrentBadgeCurrent)}>
                          {currentPageLabel}
                        </span>
                      ) : null}
                    </span>
                  </a>
                ) : (
                  <span className={styles.megaMenuSubLink}>{child.label}</span>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
});

export default MegaMenuLink;
