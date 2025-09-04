import * as React from 'react';
import { memo, useMemo } from 'react';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { getTheme } from '@fluentui/react/lib/Styling';
import { IUserSettings, DisplayMode, PillStyle, Density } from '../../types/UserSettings';
import { CategoryPillDropdowns } from './CategoryPillDropdowns';
import styles from './ModernCollabFooter.module.scss';

export interface IFooterContentProps {
  allLinksToDisplay: IContextualMenuItem[];
  handleLinkClick: (link: IContextualMenuItem, event?: React.MouseEvent) => void;
  renderLinkBadge: (link: IContextualMenuItem) => React.ReactNode;
  isLoading: boolean;
  userSettings: IUserSettings;
}

const FooterContentComponent: React.FC<IFooterContentProps> = ({
  allLinksToDisplay,
  handleLinkClick,
  renderLinkBadge,
  isLoading,
  userSettings
}) => {
  
  const theme = getTheme();

  // Apply max visible items setting
  const visibleLinks = allLinksToDisplay.slice(0, userSettings.maxVisibleItems);
  const hasMoreLinks = allLinksToDisplay.length > userSettings.maxVisibleItems;

  // Single-pass filtering for better performance - use ALL links for CategoryPillDropdowns
  const { organizationLinks, personalLinks } = useMemo(() => {
    const orgLinks: typeof allLinksToDisplay = [];
    const persLinks: typeof allLinksToDisplay = [];
    
    
    // Single pass through ALL available links - CategoryPillDropdowns handles its own limits
    allLinksToDisplay.forEach(link => {
      if (link.key?.startsWith('personal-')) {
        persLinks.push(link);
      } else {
        orgLinks.push(link);
      }
    });
    
    
    return {
      organizationLinks: orgLinks,
      personalLinks: persLinks
    };
  }, [allLinksToDisplay]);


  // Get dynamic styles based on user settings
  const getDensityClass = () => {
    switch (userSettings.density) {
      case Density.Compact: return 'densityCompact';
      case Density.Spacious: return 'densitySpacious';
      default: return 'densityNormal';
    }
  };

  const getPillStyleClass = () => {
    switch (userSettings.pillStyle) {
      case PillStyle.Square: return 'pillSquare';
      case PillStyle.Minimal: return 'pillMinimal';
      default: return 'pillRounded';
    }
  };

  const getIconSize = () => {
    switch (userSettings.iconSize) {
      case 'small': return '12px';
      case 'large': return '20px';
      default: return '16px';
    }
  };

  if (isLoading) {
    return (
      <div className={styles.contentArea}>
        <div className={`${styles.linksContainer} ${getDensityClass()}`}>
          <div style={{ 
            textAlign: 'center', 
            padding: '8px', 
            color: theme.palette.neutralSecondary,
            fontSize: '12px'
          }}>
            Loading links...
          </div>
        </div>
      </div>
    );
  }

  // Type-based dropdowns: Use CategoryPillDropdowns with mixed mode
  if (userSettings.displayMode === DisplayMode.TypeBasedDropdowns) {
    return (
      <div className={styles.contentArea}>
        <div className={`${styles.linksContainer} ${getDensityClass()} ${getPillStyleClass()}`}>
          <CategoryPillDropdowns
            organizationLinks={organizationLinks}
            personalLinks={personalLinks}
            onLinkClick={handleLinkClick}
            displayMode="mixed"
            showBadges={userSettings.showBadges}
            pillStyle={userSettings.pillStyle.toLowerCase() as 'rounded' | 'square' | 'minimal'}
            density={userSettings.density.toLowerCase() as 'compact' | 'normal' | 'spacious'}
          />
          {hasMoreLinks && (
            <span className={styles.showMoreIndicator}>+{allLinksToDisplay.length - userSettings.maxVisibleItems} more</span>
          )}
        </div>
      </div>
    );
  }

  // Category dropdowns: Individual pills for each category (General, M365, HR, etc.)
  if (userSettings.displayMode === DisplayMode.CategoryDropdowns) {
    return (
      <div className={styles.contentArea}>
        <div className={`${styles.linksContainer} ${getDensityClass()} ${getPillStyleClass()}`}>
          <CategoryPillDropdowns
            organizationLinks={organizationLinks}
            personalLinks={personalLinks}
            onLinkClick={handleLinkClick}
            displayMode="category"
            showBadges={userSettings.showBadges}
            pillStyle={userSettings.pillStyle.toLowerCase() as 'rounded' | 'square' | 'minimal'}
            density={userSettings.density.toLowerCase() as 'compact' | 'normal' | 'spacious'}
          />
          {hasMoreLinks && (
            <span className={styles.showMoreIndicator}>+{allLinksToDisplay.length - userSettings.maxVisibleItems} more</span>
          )}
        </div>
      </div>
    );
  }

  // Org/Personal dropdowns: Two pills "Org Links" and "Personal Links" with nested categories
  if (userSettings.displayMode === DisplayMode.OrgPersonalDropdowns) {
    return (
      <div className={styles.contentArea}>
        <div className={`${styles.linksContainer} ${getDensityClass()} ${getPillStyleClass()}`}>
          <CategoryPillDropdowns
            organizationLinks={organizationLinks}
            personalLinks={personalLinks}
            onLinkClick={handleLinkClick}
            displayMode="type"
            showBadges={userSettings.showBadges}
            pillStyle={userSettings.pillStyle.toLowerCase() as 'rounded' | 'square' | 'minimal'}
            density={userSettings.density.toLowerCase() as 'compact' | 'normal' | 'spacious'}
          />
          {hasMoreLinks && (
            <span className={styles.showMoreIndicator}>+{allLinksToDisplay.length - userSettings.maxVisibleItems} more</span>
          )}
        </div>
      </div>
    );
  }

  // Default flat pills display
  return (
    <div className={styles.contentArea}>
      <div className={`${styles.linksContainer} ${getDensityClass()}`}>
        {visibleLinks.length > 0 ? (
          <>
            {visibleLinks.map((link, index) => (
              <button
                key={`${link.key}-${index}`}
                className={`${styles.linkItem} ${getPillStyleClass()}`}
                onClick={(e) => handleLinkClick(link, e)}
                title={link.title || link.name}
                disabled={!link.href}
                style={{
                  // Apply user settings directly to ensure they take effect
                  display: userSettings.showIcons || userSettings.showBadges ? 'flex' : 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  fontSize: userSettings.iconSize === 'small' ? '10px' : userSettings.iconSize === 'large' ? '14px' : '11px'
                }}
              >
                {userSettings.showIcons && (
                  <span 
                    className={styles.linkIcon} 
                    style={{ 
                      fontSize: getIconSize(),
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    {link.iconProps?.iconName ? (
                      <i className={`ms-Icon ms-Icon--${link.iconProps.iconName}`} />
                    ) : (
                      <i className="ms-Icon ms-Icon--Link" />
                    )}
                  </span>
                )}
                <span>{link.name}</span>
                {userSettings.showBadges && renderLinkBadge(link)}
              </button>
            ))}
            {hasMoreLinks && (
              <span className={styles.showMoreIndicator}>+{allLinksToDisplay.length - userSettings.maxVisibleItems} more</span>
            )}
          </>
        ) : (
          <div style={{ fontSize: '11px', color: theme.palette.neutralSecondary, padding: '4px 8px' }}>
            No links available. Click "Manage My Links" to add some!
          </div>
        )}
      </div>
    </div>
  );
};

// Memoized export for performance optimization
export const FooterContent = memo(FooterContentComponent, (prevProps, nextProps) => {
  // Fast shallow checks
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.allLinksToDisplay.length !== nextProps.allLinksToDisplay.length) return false;
  if (prevProps.userSettings.maxVisibleItems !== nextProps.userSettings.maxVisibleItems) return false;
  if (prevProps.userSettings.showBadges !== nextProps.userSettings.showBadges) return false;
  if (prevProps.userSettings.density !== nextProps.userSettings.density) return false;
  if (prevProps.userSettings.pillStyle !== nextProps.userSettings.pillStyle) return false;
  if (prevProps.userSettings.displayMode !== nextProps.userSettings.displayMode) return false;
  if (prevProps.userSettings.showIcons !== nextProps.userSettings.showIcons) return false;
  if (prevProps.userSettings.iconSize !== nextProps.userSettings.iconSize) return false;
  
  // Only deep compare if shallow checks pass
  return prevProps.allLinksToDisplay.every((link, index) => 
    link.key === nextProps.allLinksToDisplay[index]?.key
  );
});