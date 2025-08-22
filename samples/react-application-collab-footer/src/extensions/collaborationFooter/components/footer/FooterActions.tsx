import * as React from 'react';
import { memo } from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import styles from './ModernCollabFooter.module.scss';

export interface IFooterActionsProps {
  showSearch: boolean;
  toggleSearch: () => void;
  handleUnifiedLinkManagement: () => void;
  handleUserSettings: () => void;
  isLoading: boolean;
  isAdmin: boolean;
  isInEditMode: boolean;
  sharePointTheme: any;
  selectedCategory?: string;
  categoryOptions?: { key: string; text: string }[];
  onCategoryChange?: (category: string) => void;
}

export const FooterActions: React.FC<IFooterActionsProps> = ({
  showSearch,
  toggleSearch,
  handleUnifiedLinkManagement,
  handleUserSettings,
  isLoading,
  isAdmin,
  isInEditMode,
  sharePointTheme,
  selectedCategory,
  categoryOptions,
  onCategoryChange
}) => {

  return (
    <div className={styles.compactActions}>
      <button
        className={`${styles.compactButton} ${styles.iconOnly}`}
        onClick={toggleSearch}
        title="Search Links"
        aria-label="Search Links"
        style={{
          backgroundColor: sharePointTheme.compactButtonBg,
          borderColor: sharePointTheme.compactButtonBorder
        }}
      >
        <Icon 
          iconName={showSearch ? 'Cancel' : 'Search'} 
          className={styles.buttonIcon}
          style={{ color: sharePointTheme.primary }}
        />
      </button>
      {isAdmin && isInEditMode && (
        <button
          className={`${styles.compactButton} ${styles.adminButton} ${styles.iconOnly}`}
          onClick={() => {/* Admin panel moved to manage links dialog */}}
          title="Admin Settings"
          aria-label="Open admin settings panel"
          style={{
            backgroundColor: sharePointTheme.adminButtonBg,
            borderColor: sharePointTheme.adminButtonBorder
          }}
        >
          <Icon 
            iconName="AdminSettings" 
            className={styles.buttonIcon}
            style={{ color: sharePointTheme.error }}
          />
        </button>
      )}
      <button
        className={`${styles.compactButton} ${styles.iconOnly}`}
        onClick={handleUserSettings}
        title="User Settings"
        aria-label="Open user settings panel"
        style={{
          backgroundColor: sharePointTheme.compactButtonBg,
          borderColor: sharePointTheme.compactButtonBorder
        }}
      >
        <Icon 
          iconName="Settings" 
          className={styles.buttonIcon}
          style={{ color: sharePointTheme.primary }}
        />
      </button>
      <button
        className={`${styles.compactButton} ${styles.iconOnly}`}
        onClick={handleUnifiedLinkManagement}
        disabled={isLoading}
        title="Manage My Links"
        aria-label="Manage personal links and select organization links"
        style={{
          backgroundColor: sharePointTheme.compactButtonBg,
          borderColor: sharePointTheme.compactButtonBorder
        }}
      >
        <Icon 
          iconName={isLoading ? 'ProgressRingDots' : 'EditNote'} 
          className={styles.buttonIcon}
          style={{ color: sharePointTheme.primary }}
        />
      </button>
    </div>
  );
};

export default memo(FooterActions);