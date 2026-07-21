import * as React from 'react';
import { Button, Popover, PopoverTrigger, PopoverSurface, SearchBox, Spinner } from '@fluentui/react-components';
import { Search20Regular, History20Regular, Document20Regular } from '@fluentui/react-icons';

import type { IHeaderStrings } from '../models/IHeaderStrings';
import type { ISearchResult } from '../models/IHeaderServices';
import type { HeaderServices } from '../services/HeaderServices';
import { sanitizeUrl } from '../utils/url';
import { emitNavigationTelemetry } from '../utils/navigationTelemetry';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import styles from './HeaderTools.module.scss';

export interface ISearchToolHandle {
  focus: () => void;
}

export interface ISearchToolProps {
  strings: IHeaderStrings;
  services: HeaderServices;
  searchScope?: string;
  placeholder?: string;
  suggestionsEnabled?: boolean;
  triggerRef?: React.Ref<ISearchToolHandle>;
  isMobile?: boolean;
  
  searchResultsPageUrl?: string;
}

const COLLAPSE_DELAY_MS = 200;

const SEARCH_DEBOUNCE_MS = 300;

const SearchTool: React.FC<ISearchToolProps> = (props) => {
  const { strings, services, searchScope, placeholder, suggestionsEnabled, triggerRef, isMobile = false, searchResultsPageUrl } = props;
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<ISearchResult[]>([]);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const [isFocused, setIsFocused] = React.useState(false);

  const [isExpanded, setIsExpanded] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const queryRef = React.useRef<string>('');
  const collapseTimeoutRef = React.useRef<number | undefined>();

  const searchRequestIdRef = React.useRef(0);
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  React.useLayoutEffect(() => {
    queryRef.current = query;
  }, [query]);

  React.useImperativeHandle(triggerRef, () => ({
    focus: (): void => {
      if (collapseTimeoutRef.current !== undefined) {
        window.clearTimeout(collapseTimeoutRef.current);
        collapseTimeoutRef.current = undefined;
      }

      setIsExpanded(true);
    }
  }), []);

  React.useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    }
  }, [isExpanded]);

  React.useEffect(() => {
    return () => {
      if (collapseTimeoutRef.current !== undefined) {
        window.clearTimeout(collapseTimeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    setRecentSearches(services.getRecentSearches());
  }, [services]);

  React.useEffect(() => {
    setActiveIndex(-1);
  }, [query, results]);

  const handleSearch = React.useCallback(
    async (newValue: string): Promise<void> => {
      if (!newValue.trim()) {
        setResults([]);
        setOpen(false);
        return;
      }

      if (!suggestionsEnabled) {
        setOpen(false);
        return;
      }

      const requestId = ++searchRequestIdRef.current;
      setIsLoading(true);
      setOpen(true);

      try {
        const searchResults = await services.search(newValue, searchScope);
        if (isMountedRef.current && searchRequestIdRef.current === requestId) {
          setResults(searchResults);
        }
      } finally {
        if (isMountedRef.current && searchRequestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    },
    [searchScope, services, suggestionsEnabled]
  );

  const debouncedSearch = useDebouncedCallback(handleSearch, SEARCH_DEBOUNCE_MS);

  const handleInputChange = React.useCallback(
    (newValue: string): void => {
      setQuery(newValue);
      void debouncedSearch(newValue);
    },
    [debouncedSearch]
  );

  const handleResultClick = React.useCallback(
    (result: ISearchResult): void => {
      const currentQuery = queryRef.current;
      services.saveRecentSearch(currentQuery);
      setRecentSearches(services.getRecentSearches());
      setOpen(false);
      emitNavigationTelemetry({
        action: 'search-result-click',
        level: 'service',
        itemLabel: result.title,
        targetUrl: result.url,
        metadata: { query: currentQuery }
      });
      window.location.href = sanitizeUrl(result.url) || '#';
    },
    [services]
  );

  const handleRecentSearchClick = React.useCallback(
    (term: string): void => {
      setQuery(term);
      void handleSearch(term);
    },
    [handleSearch]
  );

  const submitSearch = React.useCallback(
    (submittedQuery: string): void => {
      services.saveRecentSearch(submittedQuery);
      emitNavigationTelemetry({
        action: 'search-submit',
        level: 'service',
        metadata: { query: submittedQuery }
      });

      const configuredResultsUrl = sanitizeUrl(searchResultsPageUrl);
      const destination = configuredResultsUrl
        ? `${configuredResultsUrl}${configuredResultsUrl.indexOf('?') >= 0 ? '&' : '?'}q=${encodeURIComponent(submittedQuery)}`
        : `${window.location.origin}/_layouts/15/search.aspx?q=${encodeURIComponent(submittedQuery)}`;

      window.location.href = destination;
    },
    [services, searchResultsPageUrl]
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>): void => {
      const currentQuery = queryRef.current;
      if (!open) {
        if (event.key === 'Enter' && currentQuery.trim()) {
          event.preventDefault();
          submitSearch(currentQuery);
        }
        return;
      }

      switch (event.key) {
        case 'ArrowDown':
          if (results.length > 0) {
            event.preventDefault();
            setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
          }
          break;
        case 'ArrowUp':
          if (results.length > 0) {
            event.preventDefault();
            setActiveIndex((prev) => Math.max(prev - 1, -1));
          }
          break;
        case 'Escape':
          event.preventDefault();
          setOpen(false);
          break;
        case 'Enter':
          if (results.length > 0 && activeIndex >= 0 && results[activeIndex]) {
            event.preventDefault();
            handleResultClick(results[activeIndex]);
          } else if (currentQuery.trim()) {
            event.preventDefault();
            submitSearch(currentQuery);
          }
          break;
        default:
          break;
      }
    },
    [open, results, activeIndex, handleResultClick, submitSearch]
  );

  const showSuggestions = open && (results.length > 0 || (recentSearches.length > 0 && !query));

  const renderSuggestionsList = (): React.ReactElement => {
    return (
      <div className={styles.searchResultsContainer}>
        {isLoading ? (
          <div className={styles.searchSpinner}>
            <Spinner label={strings.LoadingLabel} size="small" />
          </div>
        ) : (
          <div className={styles.searchResults}>
            {results.length > 0 ? (
              <div role="listbox" className={styles.searchSection}>
                <span className={styles.searchSectionTitle}>{strings.SearchSuggestionsLabel || 'Suggestions'}</span>
                {results.map((result, index) => (
                  <button
                    key={result.url}
                    id={'search-opt-' + index}
                    aria-selected={activeIndex === index}
                    className={`${styles.searchResultItem} ${activeIndex === index ? styles.activeSuggestion : ''}`}
                    onClick={(): void => handleResultClick(result)}
                    role="option"
                    type="button"
                  >
                    <div className={styles.searchResultItemContent}>
                      <Document20Regular className={styles.searchResultIcon} />
                      <div className={styles.searchResultTexts}>
                        <span className={styles.searchResultTitle}>{result.title}</span>
                        {result.description ? (
                          <span className={styles.searchResultDescription}>{result.description}</span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}

            {recentSearches.length > 0 && !query ? (
              <div role="listbox" className={styles.searchSection}>
                <span className={styles.searchSectionTitle}>{strings.RecentSearchesLabel || 'Recent searches'}</span>
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    className={styles.searchResultItem}
                    onClick={(): void => handleRecentSearchClick(term)}
                    role="option"
                    type="button"
                  >
                    <div className={styles.searchResultItemContent}>
                      <History20Regular className={styles.searchResultIcon} />
                      <span className={styles.searchResultTitle}>{term}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  const searchBoxElement = (
    <SearchBox
      ref={inputRef}
      aria-activedescendant={activeIndex >= 0 ? 'search-opt-' + activeIndex : undefined}
      aria-label={strings.SearchAriaLabel || 'Search'}
      className={`${styles.searchInput} ${isFocused ? styles.searchFocused : ''}`}
      placeholder={placeholder || strings.SearchPlaceholder || 'Search'}
      value={query}
      onChange={(event, data): void => { handleInputChange(data.value || ''); }}
      onKeyDown={handleKeyDown}
      onFocus={(): void => {
        setIsFocused(true);
        setOpen(true);
      }}
      onBlur={(): void => {
        setIsFocused(false);

        collapseTimeoutRef.current = window.setTimeout(() => {
          collapseTimeoutRef.current = undefined;
          setOpen(false);

          if (!queryRef.current.trim()) {
            setIsExpanded(false);
          }
        }, COLLAPSE_DELAY_MS);
      }}
    />
  );

  if (isMobile) {
    return (
      <div className={styles.mobileSearchContainer}>
        {searchBoxElement}
        {showSuggestions ? renderSuggestionsList() : null}
      </div>
    );
  }

  if (!isExpanded) {
    return (
      <div className={styles.headerTool}>
        <Button
          aria-label={strings.SearchAriaLabel || 'Search'}
          className={styles.headerToolButton}
          icon={<Search20Regular />}
          appearance="subtle"
          onClick={(): void => setIsExpanded(true)}
          title={strings.SearchAriaLabel || 'Search'}
        />
      </div>
    );
  }

  return (
    <div className={styles.searchContainer}>
      <Popover open={showSuggestions} onOpenChange={(e, data) => setOpen(data.open)} positioning="below-start" trapFocus={false}>
        <PopoverTrigger>
          {searchBoxElement}
        </PopoverTrigger>

        <PopoverSurface className={styles.searchCallout}>
          {renderSuggestionsList()}
        </PopoverSurface>
      </Popover>
    </div>
  );
};

export default React.memo(SearchTool);
