import * as React from 'react';
import { Button, Popover, PopoverTrigger, PopoverSurface } from '@fluentui/react-components';
import { Bookmark24Regular, Bookmark24Filled } from '@fluentui/react-icons';

import type { IHeaderStrings } from '../models/IHeaderStrings';
import type { IBookmark } from '../models/IHeaderServices';
import type { HeaderServices } from '../services/HeaderServices';
import { sanitizeUrl } from '../utils/url';
import { emitNavigationTelemetry } from '../utils/navigationTelemetry';
import styles from './HeaderTools.module.scss';

export interface IBookmarksToolProps {
  strings: IHeaderStrings;
  services: HeaderServices;
  listUrl?: string;
  currentTitle: string;
  currentUrl: string;
}

const BookmarksTool: React.FC<IBookmarksToolProps> = (props) => {
  const { strings, services, listUrl, currentTitle, currentUrl } = props;
  const [open, setOpen] = React.useState(false);
  const [bookmarks, setBookmarks] = React.useState<IBookmark[]>([]);

  React.useEffect(() => {
    let isDisposed = false;

    const load = async (): Promise<void> => {
      const result = await services.getBookmarks(listUrl);
      if (!isDisposed) {
        setBookmarks(result);
      }
    };

    if (open) {
      void load();
    }

    return () => {
      isDisposed = true;
    };
  }, [open, listUrl, services]);

  const isCurrentBookmarked = bookmarks.some((bookmark) => bookmark.url === currentUrl);

  const handleToggleBookmark = React.useCallback((): void => {
    if (isCurrentBookmarked) {
      services.removeLocalBookmark(currentUrl);
      const next = bookmarks.filter((bookmark) => bookmark.url !== currentUrl);
      setBookmarks(next);
    } else {
      const bookmark: IBookmark = { id: `local-${Date.now()}`, title: currentTitle, url: currentUrl };
      services.saveLocalBookmark(bookmark);
      setBookmarks([bookmark, ...bookmarks]);
      emitNavigationTelemetry({
        action: 'bookmark-add',
        level: 'service',
        itemLabel: currentTitle
      });
    }
    setOpen(true);
  }, [bookmarks, currentTitle, currentUrl, isCurrentBookmarked, services]);

  return (
    <div className={styles.headerTool}>
      <Popover open={open} onOpenChange={(e, data) => setOpen(data.open)}>
        <PopoverTrigger>
          <Button
            className={styles.headerToolButton}
            icon={isCurrentBookmarked ? <Bookmark24Filled /> : <Bookmark24Regular />}
            appearance="subtle"
            onClick={handleToggleBookmark}
            title={strings.BookmarksAriaLabel || 'Bookmarks'}
          />
        </PopoverTrigger>

        <PopoverSurface className={styles.bookmarksCallout}>
          <div className={styles.bookmarksContent}>
            <h3 className={styles.calloutTitle}>{strings.BookmarksAriaLabel || 'Bookmarks'}</h3>
            {bookmarks.length === 0 ? (
              <p className={styles.emptyState}>{strings.BookmarksEmptyLabel || 'No bookmarks yet'}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {bookmarks.map((bookmark) => (
                  <a
                    key={bookmark.id}
                    className={styles.bookmarkItem}
                    href={sanitizeUrl(bookmark.url) || '#'}
                    onClick={(): void =>
                      emitNavigationTelemetry({
                        action: 'bookmark-click',
                        level: 'service',
                        itemId: bookmark.id,
                        itemLabel: bookmark.title
                      })
                    }
                  >
                    <Bookmark24Filled className={styles.bookmarkIcon} />
                    <span>{bookmark.title}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </PopoverSurface>
      </Popover>
    </div>
  );
};

export default React.memo(BookmarksTool);
