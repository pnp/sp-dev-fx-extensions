import * as React from 'react';
import { Spinner, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem, MenuItemLink } from '@fluentui/react-components';
import { ChevronDown12Regular, Open12Regular } from '@fluentui/react-icons';
import type { INavigationItem } from '../models/INavigationItem';
import type { IHeaderStrings } from '../models/IHeaderStrings';
import type { IGroupedNavigationSection, IActivePathContext } from '../utils/navigation';
import MegaMenuLink from './MegaMenuLink';
import styles from './DesktopNavigation.module.scss';
import {
  classNames,
  findActivePath,
  formatStringTemplate,
  getFeaturedNavigationItem,
  groupNavigationItems,
  itemHasChildren,
  resolveNavigationTrail
} from '../utils/navigation';

function formatCountLabel(
  singularTemplate: string | undefined,
  pluralTemplate: string | undefined,
  count: number,
  singularFallbackSuffix: string,
  pluralFallbackSuffix: string
): string {
  const template: string | undefined = count === 1 ? singularTemplate : pluralTemplate;

  if (!template) {
    return `${count} ${count === 1 ? singularFallbackSuffix : pluralFallbackSuffix}`;
  }

  return template.replace('{0}', String(count));
}

export interface IDesktopNavigationProps {
  items: INavigationItem[];
  navigationListRef: React.Ref<HTMLUListElement>;
  showLoading: boolean;
  loadingBranchIds: Record<string, true>;
  strings: IHeaderStrings;
  currentPageUrl: string;
  isTeamsContext?: boolean;
  showRail?: boolean;
  showOverview?: boolean;
  onTrackNavigation: (item: INavigationItem, level: 'desktop' | 'mobile', action?: string) => void;
  onLoadBranch: (item: INavigationItem) => void;
  activePath?: string[];
  
  visibleCount?: number;
}

const MENU_CLOSE_DELAY_MS = 180;

const DesktopNavigation: React.FC<IDesktopNavigationProps> = (props) => {
  const { items, navigationListRef, showLoading, loadingBranchIds, strings, currentPageUrl, isTeamsContext, showRail = true, showOverview = true, onTrackNavigation, onLoadBranch, activePath: activePathProp, visibleCount } = props;
  const [openDesktopMenuIndex, setOpenDesktopMenuIndex] = React.useState<number | undefined>();
  const desktopNavigationRef = React.useRef<HTMLDivElement | null>(null);
  const openDesktopMenuIndexRef = React.useRef<number | undefined>();
  const closeTimeoutRef = React.useRef<number | undefined>();

  React.useEffect(() => {
    openDesktopMenuIndexRef.current = openDesktopMenuIndex;
  }, [openDesktopMenuIndex]);
  const activeContext: IActivePathContext = React.useMemo(
    () => ({ currentPageUrl, isTeamsContext: !!isTeamsContext }),
    [currentPageUrl, isTeamsContext]
  );
  const activePath: string[] = React.useMemo(
    () => activePathProp ?? findActivePath(items, currentPageUrl),
    [activePathProp, items, currentPageUrl]
  );
  const activeItemIds: Set<string> = React.useMemo(() => new Set(activePath), [activePath]);

  const visibleItems: INavigationItem[] = React.useMemo(
    () => (visibleCount === undefined || visibleCount >= items.length ? items : items.slice(0, visibleCount)),
    [items, visibleCount]
  );
  const overflowItems: INavigationItem[] = React.useMemo(
    () => (visibleCount === undefined || visibleCount >= items.length ? [] : items.slice(visibleCount)),
    [items, visibleCount]
  );
  const hasOverflow = overflowItems.length > 0;
  const isMoreTriggerActive = hasOverflow && overflowItems.some((item) => activeItemIds.has(item.id));

  const currentPageItemId: string | undefined = activePath[activePath.length - 1];
  const currentPageLabel: string = strings.CurrentPageLabel || 'Current page';
  const currentSectionLabel: string = strings.CurrentSectionLabel || 'Current section';

  const openDesktopItem: INavigationItem | undefined = React.useMemo(
    () => openDesktopMenuIndex !== undefined ? items[openDesktopMenuIndex] : undefined,
    [items, openDesktopMenuIndex]
  );

  const openDesktopSections: IGroupedNavigationSection[] = React.useMemo(
    () => openDesktopItem ? groupNavigationItems(openDesktopItem.children, openDesktopItem.groupOrder) : [],
    [openDesktopItem]
  );

  const featuredDesktopItem: INavigationItem | undefined = React.useMemo(
    () => openDesktopItem ? getFeaturedNavigationItem(openDesktopItem.children) : undefined,
    [openDesktopItem]
  );

  const openDesktopActiveTrail: INavigationItem[] = React.useMemo(() => {
    if (!openDesktopItem) {
      return [];
    }
    return resolveNavigationTrail(items, [openDesktopItem.id]);
  }, [items, openDesktopItem]);

  const openDesktopCurrentSection: INavigationItem | undefined = React.useMemo(() => {
    const currentCrumbIndex: number = openDesktopActiveTrail.findIndex(
      (crumb) => activeItemIds.has(crumb.id)
    );
    if (currentCrumbIndex === -1) {
      return undefined;
    }
    return openDesktopActiveTrail[currentCrumbIndex];
  }, [openDesktopActiveTrail, activeItemIds]);

  const openDesktopCurrentPage: INavigationItem | undefined = React.useMemo(() => {
    if (!openDesktopItem) {
      return undefined;
    }
    const currentLeafId: string | undefined = activePath[activePath.length - 1];
    if (!currentLeafId) {
      return undefined;
    }

    const searchChildren = (nodes: INavigationItem[]): INavigationItem | undefined => {
      for (const node of nodes) {
        if (node.id === currentLeafId) {
          return node;
        }
        if (node.children.length > 0) {
          const found = searchChildren(node.children);
          if (found) {
            return found;
          }
        }
      }
      return undefined;
    };

    return searchChildren(openDesktopItem.children);
  }, [openDesktopItem, activePath]);

  const openDesktopTrailLabel: string | undefined = React.useMemo(() => {
    if (!openDesktopItem) {
      return undefined;
    }
    const fullTrail = resolveNavigationTrail(items, activePath);
    const subTrailIndex = fullTrail.findIndex((node) => node.id === openDesktopItem.id);
    if (subTrailIndex === -1) {
      return undefined;
    }
    const relevantTrail = fullTrail.slice(subTrailIndex + 1);
    if (relevantTrail.length <= 1) {
      return undefined;
    }
    return relevantTrail.map((node) => node.label).join(' / ');
  }, [items, openDesktopItem, activePath]);

  const openDesktopOverviewTitle: string = openDesktopItem ? openDesktopItem.label : '';
  const openDesktopOverviewDescription: string = openDesktopItem && openDesktopItem.description ? openDesktopItem.description : '';

  const isOpenDesktopBranchLoading: boolean = openDesktopItem
    ? !!loadingBranchIds[openDesktopItem.id] && openDesktopItem.children.length === 0
    : false;

  const handleCloseMenu = React.useCallback((): void => {
    setOpenDesktopMenuIndex(undefined);
  }, []);

  const handleTopLevelButtonClick = React.useCallback(
    (item: INavigationItem, index: number): void => {
      if (openDesktopMenuIndex === index) {
        handleCloseMenu();
      } else {
        if (itemHasChildren(item) && item.children.length === 0) {
          onLoadBranch(item);
        }
        setOpenDesktopMenuIndex(index);
        onTrackNavigation(item, 'desktop', 'open-submenu');
      }
    },
    [openDesktopMenuIndex, handleCloseMenu, onLoadBranch, onTrackNavigation]
  );

  const handleTopLevelLinkClick = React.useCallback(
    (item: INavigationItem): void => {
      onTrackNavigation(item, 'desktop');
      handleCloseMenu();
    },
    [onTrackNavigation, handleCloseMenu]
  );

  const handleDesktopItemHover = React.useCallback(
    (item: INavigationItem, index: number): void => {
      if (closeTimeoutRef.current !== undefined) {
        window.clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = undefined;
      }

      if (openDesktopMenuIndexRef.current === index) {
        return;
      }

      if (!itemHasChildren(item)) {

        if (openDesktopMenuIndexRef.current !== undefined) {
          handleCloseMenu();
        }
        return;
      }

      if (item.children.length === 0) {
        onLoadBranch(item);
      }
      setOpenDesktopMenuIndex(index);
    },
    [onLoadBranch, handleCloseMenu]
  );

  const handleDesktopContainerMouseLeave = React.useCallback((): void => {
    if (closeTimeoutRef.current !== undefined) {
      window.clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = window.setTimeout(() => {
      handleCloseMenu();
    }, MENU_CLOSE_DELAY_MS);
  }, [handleCloseMenu]);

  const handleDesktopContainerMouseEnter = React.useCallback((): void => {
    if (closeTimeoutRef.current !== undefined) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = undefined;
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (closeTimeoutRef.current !== undefined) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const closeMenuAndNavigate = React.useCallback(
    (item: INavigationItem): void => {
      onTrackNavigation(item, 'desktop');
      handleCloseMenu();
    },
    [onTrackNavigation, handleCloseMenu]
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleCloseMenu();
      }
    },
    [handleCloseMenu]
  );

  const renderRail = showRail && (showOverview || !!featuredDesktopItem);

  return (
    <div
      className={styles.desktopNavShell}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleDesktopContainerMouseEnter}
      onMouseLeave={handleDesktopContainerMouseLeave}
      ref={desktopNavigationRef}
    >
      {showLoading ? (
        <div
          aria-busy="true"
          aria-label={strings.LoadingLabel}
          aria-live="polite"
          className={styles.desktopLoading}
          role="status"
        >
          <div className={styles.shimmerContainer}>
            <div className={styles.shimmerBlock} style={{ width: '120px' }} />
            <div className={styles.shimmerBlock} style={{ width: '120px' }} />
            <div className={styles.shimmerBlock} style={{ width: '120px' }} />
          </div>
        </div>
      ) : (
        <nav aria-label={strings.NavigationLabel} className={styles.desktopNav}>
          <div className={styles.desktopNavMenuBar}>
            <ul className={styles.desktopNavList} ref={navigationListRef}>
              {visibleItems.map((item: INavigationItem, index: number) => {
                const isActive: boolean = activeItemIds.has(item.id);
                const isOpen: boolean = openDesktopMenuIndex === index;
                const triggerId = `mega-menu-trigger-${index}`;
                const menuId = `mega-menu-${index}`;
                const triggerClassName: string = classNames(
                  styles.topLevelTrigger,
                  isActive ? styles.topLevelTriggerActive : undefined,
                  isOpen ? styles.topLevelTriggerOpen : undefined
                );

                if (itemHasChildren(item)) {
                  return (
                    <li className={styles.topLevelItem} key={item.id}>
                      <button
                        aria-controls={menuId}
                        aria-current={isActive ? 'true' : undefined}
                        aria-expanded={isOpen}
                        aria-haspopup="true"
                        aria-label={formatStringTemplate(strings.SubmenuAriaLabel, item.label)}
                        id={triggerId}
                        className={triggerClassName}
                        onClick={(): void => handleTopLevelButtonClick(item, index)}
                        onMouseEnter={(): void => handleDesktopItemHover(item, index)}
                        type="button"
                      >
                        <span>{item.label}</span>
                        <ChevronDown12Regular className={styles.topLevelChevron} />
                      </button>
                    </li>
                  );
                }

                return (
                  <li className={styles.topLevelItem} key={item.id}>
                    <a
                      aria-current={isActive ? 'page' : undefined}
                      className={triggerClassName}
                      href={item.url}
                      id={triggerId}
                      onClick={(): void => handleTopLevelLinkClick(item)}
                      onMouseEnter={(): void => handleDesktopItemHover(item, index)}
                      {...(item.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      <span>{item.label}</span>
                      {item.isExternal ? <Open12Regular className={styles.externalIcon} /> : null}
                    </a>
                  </li>
                );
              })}

              {hasOverflow ? (
                <li className={styles.topLevelItem}>
                  <Menu>
                    <MenuTrigger disableButtonEnhancement>
                      <button
                        aria-label={strings.MoreNavItemsAriaLabel || 'More'}
                        className={classNames(
                          styles.topLevelTrigger,
                          isMoreTriggerActive ? styles.topLevelTriggerActive : undefined
                        )}
                        type="button"
                      >
                        <span>{strings.MoreNavItemsLabel || 'More'}</span>
                        <ChevronDown12Regular className={styles.topLevelChevron} />
                      </button>
                    </MenuTrigger>

                    <MenuPopover>
                      <MenuList>
                        {overflowItems.map((item) => {
                          const itemIsActive = activeItemIds.has(item.id);

                          if (!itemHasChildren(item)) {
                            return (
                              <MenuItemLink
                                key={item.id}
                                href={item.url || '#'}
                                aria-current={itemIsActive ? 'page' : undefined}
                                onClick={(): void => onTrackNavigation(item, 'desktop')}
                                {...(item.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                              >
                                {item.label}
                              </MenuItemLink>
                            );
                          }

                          return (
                            <Menu
                              key={item.id}
                              onOpenChange={(_e, data): void => {
                                if (data.open && item.children.length === 0) {
                                  onLoadBranch(item);
                                }
                              }}
                            >
                              <MenuTrigger disableButtonEnhancement>
                                <MenuItem aria-current={itemIsActive ? 'page' : undefined}>{item.label}</MenuItem>
                              </MenuTrigger>
                              <MenuPopover>
                                <MenuList>
                                  {item.children.length === 0 ? (
                                    <MenuItem disabled>{strings.LoadingLabel || 'Loading...'}</MenuItem>
                                  ) : (
                                    item.children.map((child) => (
                                      <MenuItemLink
                                        key={child.id}
                                        href={child.url || '#'}
                                        aria-current={activeItemIds.has(child.id) ? 'page' : undefined}
                                        onClick={(): void => onTrackNavigation(child, 'desktop')}
                                        {...(child.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                      >
                                        {child.label}
                                      </MenuItemLink>
                                    ))
                                  )}
                                </MenuList>
                              </MenuPopover>
                            </Menu>
                          );
                        })}
                      </MenuList>
                    </MenuPopover>
                  </Menu>
                </li>
              ) : null}
            </ul>
          </div>
        </nav>
      )}

      {openDesktopItem ? (
        <section
          aria-labelledby={`mega-menu-trigger-${openDesktopMenuIndex}`}
          className={styles.megaMenuSurface}
          id={`mega-menu-${openDesktopMenuIndex}`}
        >
          <div className={styles.megaMenuFocusArea}>
            <div className={styles.megaMenuInner}>
              <div className={styles.megaMenuHeader}>
                <div className={styles.megaMenuTitleBlock}>
                  <h2 className={styles.megaMenuTitle}>
                    {openDesktopItem.label}
                  </h2>
                  {openDesktopItem.description ? (
                    <p className={styles.megaMenuDescription}>{openDesktopItem.description}</p>
                  ) : null}
                </div>
              </div>

              <div className={classNames(styles.megaMenuContent, !renderRail ? styles.megaMenuContentNoRail : undefined)}>
                {renderRail ? (
                  <aside className={styles.megaMenuRail}>
                    {showOverview ? (
                      <div className={styles.megaMenuOverviewCard}>
                        <span className={styles.megaMenuOverviewEyebrow}>{strings.OverviewLabel}</span>
                        <h3 className={styles.megaMenuOverviewTitle}>
                          {openDesktopOverviewTitle}
                        </h3>
                        {openDesktopOverviewDescription ? (
                          <p className={styles.megaMenuOverviewDescription}>{openDesktopOverviewDescription}</p>
                        ) : null}
                        <div className={styles.megaMenuOverviewMeta}>
                          <span className={styles.megaMenuMetaBadge}>{formatCountLabel(strings.SectionCountSingleLabel, strings.SectionCountLabel, openDesktopSections.length, 'section', 'sections')}</span>
                          {openDesktopCurrentSection ? (
                            <span className={classNames(styles.megaMenuMetaBadge, styles.megaMenuMetaBadgeActive)}>
                              {currentSectionLabel}: {openDesktopCurrentSection.label}
                            </span>
                          ) : null}
                        </div>
                        {openDesktopItem.url ? (
                          <a
                            aria-label={formatStringTemplate(strings.ViewAllForLabel, openDesktopItem.label)}
                            className={styles.megaMenuOverviewLink}
                            href={openDesktopItem.url}
                            onClick={(): void => closeMenuAndNavigate(openDesktopItem)}
                          >
                            {strings.ViewAllLabel}
                          </a>
                        ) : null}

                        {openDesktopCurrentPage ? (
                          <div className={styles.currentPageCard}>
                            <span className={styles.currentPageEyebrow}>{currentPageLabel}</span>
                            <h3 className={styles.currentPageTitle}>{openDesktopCurrentPage.label}</h3>
                            {openDesktopTrailLabel ? (
                              <p className={styles.currentPageTrail}>{openDesktopTrailLabel}</p>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {featuredDesktopItem ? (
                      <a
                        className={styles.featuredCard}
                        href={featuredDesktopItem.url}
                        onClick={(): void => closeMenuAndNavigate(featuredDesktopItem)}
                      >
                        <div className={styles.featuredEyebrow}>{strings.FeaturedLabel}</div>
                        <div className={styles.featuredTitleRow}>
                          <h3 className={styles.featuredTitle}>
                            {featuredDesktopItem.label}
                          </h3>
                          {featuredDesktopItem.isExternal ? (
                            <Open12Regular className={styles.externalIcon} />
                          ) : null}
                        </div>
                        {featuredDesktopItem.description ? (
                          <p className={styles.featuredDescription}>{featuredDesktopItem.description}</p>
                        ) : null}
                        <span className={styles.featuredCta}>{strings.ViewAllLabel}</span>
                      </a>
                    ) : null}
                  </aside>
                ) : null}

                <div className={styles.megaMenuSectionsArea}>
                  <div className={styles.megaMenuSections}>
                    {isOpenDesktopBranchLoading ? (
                      <div className={styles.megaMenuLoading}>
                        <Spinner label={strings.LoadingLabel} size="small" />
                      </div>
                    ) : (
                      openDesktopSections.map((section) => (
                        <section className={styles.megaMenuSection} key={section.key}>
                          <div className={styles.megaMenuSectionHeading}>
                            <h3 className={styles.megaMenuSectionTitle}>{section.title}</h3>
                          </div>
                          <ul className={styles.megaMenuLinkList}>
                            {section.items.map((item: INavigationItem) => (
                              <li className={styles.megaMenuLinkItem} key={item.id}>
                                <MegaMenuLink
                                  activeContext={activeContext}
                                  activeItemIds={activeItemIds}
                                  currentPageItemId={currentPageItemId}
                                  item={item}
                                  onNavigate={closeMenuAndNavigate}
                                  strings={strings}
                                />
                              </li>
                            ))}
                          </ul>
                        </section>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default React.memo(DesktopNavigation);
