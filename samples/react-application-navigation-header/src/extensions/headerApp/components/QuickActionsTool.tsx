import * as React from 'react';
import { Button, Popover, PopoverTrigger, PopoverSurface, Tooltip } from '@fluentui/react-components';
import { MoreHorizontal24Regular } from '@fluentui/react-icons';

import type { IHeaderStrings } from '../models/IHeaderStrings';
import type { IQuickAction } from '../models/IHeaderServices';
import { DynamicIcon } from './DynamicIcon';
import { sanitizeUrl } from '../utils/url';
import { emitNavigationTelemetry } from '../utils/navigationTelemetry';
import styles from './HeaderTools.module.scss';

export interface IQuickActionsToolProps {
  strings: IHeaderStrings;
  actions: IQuickAction[];
}

const QuickActionsTool: React.FC<IQuickActionsToolProps> = (props) => {
  const { strings, actions } = props;
  const [open, setOpen] = React.useState(false);

  const visibleActions = actions.slice(0, 5);

  const handleOpenChange = React.useCallback((e: unknown, data: { open: boolean }): void => {
    setOpen(data.open);
    if (data.open) {
      emitNavigationTelemetry({
        action: 'quick-actions-open',
        level: 'service'
      });
    }
  }, []);

  return (
    <div className={styles.headerTool}>
      {visibleActions.length <= 3 ? (
        visibleActions.map((action) => (
          <Tooltip content={action.label} relationship="label" key={action.id}>
            <Button
              className={styles.headerToolButton}
              icon={<DynamicIcon iconName={action.iconName} />}
              appearance="subtle"
              onClick={(): void => {
                emitNavigationTelemetry({
                  action: 'quick-action-click',
                  level: 'service',
                  itemId: action.id,
                  itemLabel: action.label
                });
                window.open(sanitizeUrl(action.url) || '#', action.target || '_self');
              }}
              title={action.label}
            />
          </Tooltip>
        ))
      ) : (
        <>
          <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger>
              <Button
                className={styles.headerToolButton}
                icon={<MoreHorizontal24Regular />}
                appearance="subtle"
                onClick={() => setOpen(!open)}
                title={strings.QuickActionsAriaLabel || 'Quick actions'}
              />
            </PopoverTrigger>

            <PopoverSurface className={styles.quickActionsCallout}>
              <div className={styles.quickActionsContent}>
                <h3 className={styles.calloutTitle}>{strings.QuickActionsAriaLabel || 'Quick actions'}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {visibleActions.map((action) => (
                    <a
                      key={action.id}
                      className={styles.quickActionItem}
                      href={sanitizeUrl(action.url) || '#'}
                      onClick={(): void =>
                        emitNavigationTelemetry({
                          action: 'quick-action-click',
                          level: 'service',
                          itemId: action.id,
                          itemLabel: action.label
                        })
                      }
                      target={action.target || '_self'}
                    >
                      <DynamicIcon className={styles.quickActionIcon} iconName={action.iconName} />
                      <span>{action.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </PopoverSurface>
          </Popover>
        </>
      )}
    </div>
  );
};

export default React.memo(QuickActionsTool);
