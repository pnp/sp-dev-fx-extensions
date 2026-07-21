import * as React from 'react';
import { Button, Spinner, OverlayDrawer, DrawerBody } from '@fluentui/react-components';
import { ChevronLeft24Regular, Dismiss24Regular, ChevronRight16Regular, Open16Regular } from '@fluentui/react-icons';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';

import type { INavigationItem } from '../models/INavigationItem';
import type { IHeaderStrings } from '../models/IHeaderStrings';
import type { IHeaderFeatures } from '../models/IHeaderFeatures';

import { HeaderServices } from '../services/HeaderServices';
import { classNames, findActivePath, formatStringTemplate, itemHasChildren, resolveNavigationTrail } from '../utils/navigation';
import { useMoreToolsItems } from '../hooks/useMoreToolsItems';
import SearchTool from './SearchTool';
import UserProfileTool from './UserProfileTool';
import NotificationsTool from './NotificationsTool';
import AppLauncherTool from './AppLauncherTool';
import QuickActionsTool from './QuickActionsTool';
import BookmarksTool from './BookmarksTool';
import MoreToolsMenu from './MoreToolsMenu';
import styles from './MobilePanel.module.scss';

export interface IMobilePanelProps {
  isOpen: boolean;
  onDismiss: () => void;
  items: INavigationItem[];
  showLoading: boolean;
  loadingBranchIds: Record<string, true>;
  strings: IHeaderStrings;
  themeVariant?: IReadonlyTheme;
  currentPageUrl: string;
  features: IHeaderFeatures;
  headerServices: HeaderServices;
  currentLanguage: string;
  onChangeLanguage: (languageCode: string) => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  fontScale: number;
  onChangeFontScale: (value: number) => void;
  onTrackNavigation: (item: INavigationItem, level: 'desktop' | 'mobile', action?: string) => void;
  onLoadBranch: (item: INavigationItem) => void;
  documentTitle: string;
  activePath?: string[];
}

const MobilePanel: React.FC<IMobilePanelProps> = (props) => {
  const {
    isOpen,
    onDismiss,
    items,
    showLoading,
    loadingBranchIds,
    strings,
    currentPageUrl,
    features,
    headerServices,
    currentLanguage,
    onChangeLanguage,
    isHighContrast,
    onToggleHighContrast,
    fontScale,
    onChangeFontScale,
    onTrackNavigation,
    onLoadBranch,
    documentTitle,
    activePath: activePathProp
  } = props;
  const [mobileTrailIds, setMobileTrailIds] = React.useState<string[]>([]);
  const [mobileDirection, setMobileDirection] = React.useState<'forward' | 'back'>('forward');
  const liveRegionRef = React.useRef<HTMLSpanElement | null>(null);
  const headingRef = React.useRef<HTMLHeadingElement | null>(null);
  const hasOpenedRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    if (!isOpen) {
      setMobileTrailIds([]);
      setMobileDirection('forward');
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const mobileTrail: INavigationItem[] = React.useMemo(
    () => resolveNavigationTrail(items, mobileTrailIds),
    [items, mobileTrailIds]
  );

  const currentMobileItem: INavigationItem | undefined = mobileTrail[mobileTrail.length - 1];
  const currentMobileItems: INavigationItem[] = React.useMemo(
    () => currentMobileItem ? currentMobileItem.children : items,
    [currentMobileItem, items]
  );

  const currentMobileLevelKey: string = React.useMemo(
    () => mobileTrailIds.join('/') || 'root',
    [mobileTrailIds]
  );

  const isCurrentMobileLevelLoading: boolean = currentMobileItem
    ? !!loadingBranchIds[currentMobileItem.id] && currentMobileItem.children.length === 0
    : showLoading;

  const activePath: string[] = React.useMemo(
    () => activePathProp ?? findActivePath(items, currentPageUrl),
    [activePathProp, items, currentPageUrl]
  );
  const activeItemIds: Set<string> = React.useMemo(() => new Set(activePath), [activePath]);

  const appLauncherItems = React.useMemo(
    () => headerServices.parseAppLauncherItems(features.appLauncherJson),
    [features.appLauncherJson, headerServices]
  );
  const quickActions = React.useMemo(
    () => headerServices.parseQuickActions(features.quickActionsJson),
    [features.quickActionsJson, headerServices]
  );
  const languageOptions = React.useMemo(
    () => headerServices.parseLanguageOptions(features.supportedLanguages, features.defaultLanguage),
    [features.supportedLanguages, features.defaultLanguage, headerServices]
  );

  const moreToolsItems = useMoreToolsItems({
    strings,
    features,
    languageOptions,
    currentLanguage,
    onChangeLanguage,
    isHighContrast,
    onToggleHighContrast,
    fontScale,
    onChangeFontScale
  });

  const currentContextTitle: string = currentMobileItem ? currentMobileItem.label : strings.NavigationLabel;

  React.useEffect(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = currentContextTitle;
    }
  }, [currentContextTitle]);

  React.useEffect(() => {
    if (!isOpen) {
      hasOpenedRef.current = false;
      return;
    }

    if (!hasOpenedRef.current) {
      hasOpenedRef.current = true;
      return;
    }

    headingRef.current?.focus();
  }, [currentMobileLevelKey, isOpen]);

  const handleMobileAdvance = React.useCallback(
    (item: INavigationItem): void => {
      setMobileDirection('forward');

      if (itemHasChildren(item) && item.children.length === 0) {
        onLoadBranch(item);
      }

      setMobileTrailIds((currentTrail: string[]) => [...currentTrail, item.id]);
    },
    [onLoadBranch]
  );

  const handleMobileBack = React.useCallback((): void => {
    setMobileDirection('back');
    setMobileTrailIds((currentTrail: string[]) => currentTrail.slice(0, -1));
  }, []);

  const handleMobileTrailJump = React.useCallback((targetDepth: number): void => {
    setMobileDirection('back');
    setMobileTrailIds((currentTrail: string[]) => currentTrail.slice(0, targetDepth));
  }, []);

  const handleMobileRootButton = React.useCallback((): void => {
    handleMobileTrailJump(0);
  }, [handleMobileTrailJump]);

  const handleBreadcrumbJump = React.useCallback(
    (index: number): void => {
      handleMobileTrailJump(index);
    },
    [handleMobileTrailJump]
  );

  const handleMobileViewAllLink = React.useCallback(
    (item: INavigationItem): void => {
      onTrackNavigation(item, 'mobile');
      onDismiss();
    },
    [onDismiss, onTrackNavigation]
  );

  const handleMobileItemClick = React.useCallback(
    (item: INavigationItem): void => {
      onTrackNavigation(item, 'mobile', 'open-section');
      handleMobileAdvance(item);
    },
    [onTrackNavigation, handleMobileAdvance]
  );

  const handleMobileItemLinkClick = React.useCallback(
    (item: INavigationItem): void => {
      onTrackNavigation(item, 'mobile');
      onDismiss();
    },
    [onDismiss, onTrackNavigation]
  );

  return (
    <OverlayDrawer
      open={isOpen}
      position="start"
      onOpenChange={(e, data): void => {
        if (!data.open) {
          onDismiss();
        }
      }}
    >
      <DrawerBody className={styles.mobilePanelContent}>
        <span aria-live="polite" className={styles.mobileLiveRegion} ref={liveRegionRef} />
        <div className={styles.mobilePanelHeader}>
          <div className={styles.mobileHeaderActions}>
            <div className={styles.mobileHeaderPrimaryActions}>
              {mobileTrail.length > 0 ? (
                <button className={styles.mobileBackButton} onClick={handleMobileBack} type="button">
                  <ChevronLeft24Regular />
                  <span>{strings.BackButtonLabel}</span>
                </button>
              ) : null}
            </div>

            <Button
              aria-label={strings.CloseMenuLabel}
              className={styles.mobileCloseButton}
              icon={<Dismiss24Regular />}
              appearance="subtle"
              onClick={onDismiss}
              title={strings.CloseMenuLabel}
            />
          </div>

          {mobileTrail.length > 0 ? (
            <nav aria-label={strings.MobileBreadcrumbsAriaLabel} className={styles.mobileBreadcrumbs}>
              <button className={styles.mobileBreadcrumbButton} onClick={handleMobileRootButton} type="button">
                {strings.NavigationLabel}
              </button>
              {mobileTrail.map((item: INavigationItem, index: number) => {
                const isCurrentCrumb: boolean = index === mobileTrail.length - 1;

                return (
                  <React.Fragment key={item.id}>
                    <span aria-hidden={true} className={styles.mobileBreadcrumbSeparator}>/</span>
                    {isCurrentCrumb ? (
                      <span aria-current="page" className={styles.mobileBreadcrumbCurrent}>{item.label}</span>
                    ) : (
                      <button
                        className={styles.mobileBreadcrumbButton}
                        onClick={(): void => handleBreadcrumbJump(index + 1)}
                        type="button"
                      >
                        {item.label}
                      </button>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          ) : null}

          <div className={styles.mobileCurrentContext}>
            <h2 className={styles.mobileCurrentTitle} ref={headingRef} tabIndex={-1}>
              {currentContextTitle}
            </h2>
            {currentMobileItem?.description ? (
              <p className={styles.mobileCurrentDescription}>{currentMobileItem.description}</p>
            ) : null}
            {currentMobileItem?.url ? (
              <a
                className={styles.mobileViewAllLink}
                href={currentMobileItem.url}
                onClick={(): void => handleMobileViewAllLink(currentMobileItem)}
              >
                {strings.ViewAllLabel}
              </a>
            ) : null}
          </div>
        </div>

        {isCurrentMobileLevelLoading ? (
          <div className={styles.mobileLoading}>
            <Spinner label={strings.LoadingLabel} size="small" />
          </div>
        ) : (
          <div
            className={classNames(
              styles.mobileLevel,
              mobileDirection === 'forward' ? styles.mobileLevelForward : styles.mobileLevelBack
            )}
            key={currentMobileLevelKey}
          >
            {currentMobileItems.length === 0 ? (
              <p className={styles.mobileEmpty}>{strings.EmptySectionLabel}</p>
            ) : (
              <ul className={styles.mobileList}>
                {currentMobileItems.map((item: INavigationItem) => (
                  <li className={styles.mobileListItem} key={item.id}>
                    {itemHasChildren(item) ? (
                      <button
                        aria-label={formatStringTemplate(strings.SubmenuAriaLabel, item.label)}
                        className={styles.mobileItemButton}
                        onClick={(): void => handleMobileItemClick(item)}
                        type="button"
                      >
                        <div className={styles.mobileItemMeta}>
                          <span className={styles.mobileItemLabel}>{item.label}</span>
                          {item.description ? <span className={styles.mobileItemDescription}>{item.description}</span> : null}
                        </div>
                        <ChevronRight16Regular className={styles.mobileItemChevron} />
                      </button>
                    ) : (
                      <a
                        aria-current={activeItemIds.has(item.id) ? 'page' : undefined}
                        className={styles.mobileItemLink}
                        href={item.url}
                        onClick={(): void => handleMobileItemLinkClick(item)}
                        {...(item.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      >
                        <div className={styles.mobileItemMeta}>
                          <span className={styles.mobileItemLabel}>{item.label}</span>
                          {item.description ? <span className={styles.mobileItemDescription}>{item.description}</span> : null}
                        </div>
                        {item.isExternal ? <Open16Regular className={styles.mobileItemExternalIcon} /> : null}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {features.searchEnabled ? (

          <div className={styles.mobileSearchSection}>
            <SearchTool
              strings={strings}
              services={headerServices}
              searchScope={features.searchScope}
              placeholder={features.searchPlaceholder}
              suggestionsEnabled={features.searchSuggestionsEnabled}
              searchResultsPageUrl={features.searchResultsPageUrl}
              isMobile={true}
            />
          </div>
        ) : null}

        {features.userProfileEnabled || features.notificationsEnabled || features.quickActionsEnabled || features.appLauncherEnabled || features.bookmarksEnabled || moreToolsItems.length > 0 ? (
          <div className={styles.mobileToolsPanel}>
            {moreToolsItems.length > 0 ? (
              <div className={styles.mobileToolItem}>
                <MoreToolsMenu strings={strings} items={moreToolsItems} />
              </div>
            ) : null}

            {features.quickActionsEnabled && quickActions.length > 0 ? (
              <div className={styles.mobileToolItem}>
                <QuickActionsTool strings={strings} actions={quickActions} />
              </div>
            ) : null}

            {features.notificationsEnabled ? (
              <div className={styles.mobileToolItem}>
                <NotificationsTool strings={strings} services={headerServices} listUrl={features.notificationListUrl} />
              </div>
            ) : null}

            {features.appLauncherEnabled && appLauncherItems.length > 0 ? (
              <div className={styles.mobileToolItem}>
                <AppLauncherTool strings={strings} items={appLauncherItems} />
              </div>
            ) : null}

            {features.bookmarksEnabled ? (
              <div className={styles.mobileToolItem}>
                <BookmarksTool
                  strings={strings}
                  services={headerServices}
                  listUrl={features.bookmarkListUrl}
                  currentTitle={documentTitle || strings.NavigationLabel}
                  currentUrl={currentPageUrl}
                />
              </div>
            ) : null}

            {features.userProfileEnabled ? (
              <div className={styles.mobileToolItem}>
                <UserProfileTool strings={strings} services={headerServices} />
              </div>
            ) : null}
          </div>
        ) : null}
      </DrawerBody>
    </OverlayDrawer>
  );
};

export default React.memo(MobilePanel);
