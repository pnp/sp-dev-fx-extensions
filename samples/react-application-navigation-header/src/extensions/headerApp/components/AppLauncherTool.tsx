import * as React from 'react';
import { Button, Popover, PopoverTrigger, PopoverSurface } from '@fluentui/react-components';
import { Grid24Regular } from '@fluentui/react-icons';

import type { IHeaderStrings } from '../models/IHeaderStrings';
import type { IAppLauncherItem } from '../models/IHeaderServices';
import { DynamicIcon } from './DynamicIcon';
import { sanitizeUrl } from '../utils/url';
import { emitNavigationTelemetry } from '../utils/navigationTelemetry';
import styles from './HeaderTools.module.scss';

export interface IAppLauncherToolProps {
  strings: IHeaderStrings;
  items: IAppLauncherItem[];
}

const AppLauncherTool: React.FC<IAppLauncherToolProps> = (props) => {
  const { strings, items } = props;
  const [open, setOpen] = React.useState(false);

  const handleOpenChange = React.useCallback((e: unknown, data: { open: boolean }): void => {
    setOpen(data.open);
    if (data.open) {
      emitNavigationTelemetry({
        action: 'app-launcher-open',
        level: 'service'
      });
    }
  }, []);

  const groupedItems = React.useMemo(() => {
    const groups: Record<string, IAppLauncherItem[]> = {};
    items.forEach((item: IAppLauncherItem) => {
      const group = item.group || 'Apps';
      groups[group] = groups[group] ?? [];
      groups[group].push(item);
    });
    return groups;
  }, [items]);

  return (
    <div className={styles.headerTool}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger>
          <Button
            className={styles.headerToolButton}
            icon={<Grid24Regular />}
            appearance="subtle"
            onClick={() => setOpen(!open)}
            title={strings.AppLauncherAriaLabel || 'App launcher'}
          />
        </PopoverTrigger>

        <PopoverSurface className={styles.appLauncherCallout}>
          <div className={styles.appLauncherContent}>
            <h3 className={styles.calloutTitle}>{strings.AppLauncherAriaLabel || 'Apps'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.keys(groupedItems).map((group: string) => {
                const groupItems = groupedItems[group];
                return (
                  <div key={group}>
                    <span className={styles.appLauncherGroupTitle}>{group}</span>
                    <div className={styles.appLauncherGrid}>
                      {groupItems.map((item: IAppLauncherItem) => (
                        <a
                          key={item.id}
                          className={styles.appLauncherItem}
                          href={sanitizeUrl(item.url) || '#'}
                          onClick={(): void =>
                            emitNavigationTelemetry({
                              action: 'app-launcher-click',
                              level: 'service',
                              itemId: item.id,
                              itemLabel: item.label
                            })
                          }
                        >
                          <DynamicIcon className={styles.appLauncherIcon} iconName={item.iconName} />
                          <span>{item.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverSurface>
      </Popover>
    </div>
  );
};

export default React.memo(AppLauncherTool);
