import * as React from 'react';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { getTheme } from '@fluentui/react/lib/Styling';
import styles from './ModernCollabFooter.module.scss';

export interface IFooterSearchProps {
  showSearch: boolean;
  searchQuery: string;
  handleSearchChange: (event?: React.ChangeEvent<HTMLInputElement>, newValue?: string) => void;
  handleSearchClear: () => void;
  filteredLinks: IContextualMenuItem[];
  handleLinkClick: (link: IContextualMenuItem, event?: React.MouseEvent) => void;
  renderLinkBadge: (link: IContextualMenuItem) => React.ReactNode;
}

export const FooterSearch: React.FC<IFooterSearchProps> = ({
  showSearch,
  searchQuery,
  handleSearchChange,
  handleSearchClear,
  filteredLinks,
  handleLinkClick,
  renderLinkBadge
}) => {
  const theme = getTheme();

  if (!showSearch) return null;

  return (
    <div className={styles.searchArea}>
      <SearchBox
        placeholder="Search all links..."
        value={searchQuery}
        onChange={handleSearchChange}
        onClear={handleSearchClear}
        className={styles.searchBox}
        styles={{
          root: { width: '300px', marginRight: '8px' },
          field: { fontSize: '12px', padding: '4px 8px' }
        }}
      />
      {searchQuery.length > 0 && (
        <div className={styles.searchResults}>
          {filteredLinks.length > 0 ? (
            <>
              <div style={{ fontSize: '11px', color: theme.palette.neutralSecondary, padding: '4px 8px' }}>
                Found {filteredLinks.length} link{filteredLinks.length !== 1 ? 's' : ''}
              </div>
              {filteredLinks.slice(0, 5).map((link, index) => (
                <button
                  key={index}
                  className={styles.linkPill}
                  onClick={(e) => handleLinkClick(link, e)}
                  title={link.title || link.name}
                >
                  <span className={styles.linkIcon}>
                    {link.iconProps?.iconName ? (
                      <i className={`ms-Icon ms-Icon--${link.iconProps.iconName}`} />
                    ) : (
                      <i className="ms-Icon ms-Icon--Link" />
                    )}
                  </span>
                  <span>{link.name}</span>
                  {renderLinkBadge(link)}
                </button>
              ))}
            </>
          ) : (
            <div style={{ fontSize: '11px', color: theme.palette.neutralSecondary, padding: '4px 8px' }}>
              No links found for "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};