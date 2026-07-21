import * as React from 'react';
import { Button, Popover, PopoverTrigger, PopoverSurface } from '@fluentui/react-components';
import { Wrench24Regular } from '@fluentui/react-icons';

import type { IHeaderStrings } from '../models/IHeaderStrings';
import styles from './HeaderTools.module.scss';

export interface IMoreToolsMenuItem {
  key: string;
  label: string;
  node: React.ReactNode;
}

export interface IMoreToolsMenuProps {
  strings: IHeaderStrings;
  items: IMoreToolsMenuItem[];
}

const MoreToolsMenu: React.FC<IMoreToolsMenuProps> = (props) => {
  const { strings, items } = props;
  const [open, setOpen] = React.useState(false);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={styles.headerTool}>
      <Popover open={open} onOpenChange={(e, data): void => setOpen(data.open)}>
        <PopoverTrigger>
          <Button
            className={styles.headerToolButton}

            icon={<Wrench24Regular />}
            appearance="subtle"
            onClick={(): void => setOpen(!open)}
            title={strings.MoreToolsAriaLabel || 'More tools'}
          />
        </PopoverTrigger>

        <PopoverSurface className={styles.moreToolsCallout}>
          <div className={styles.quickActionsContent}>
            <h3 className={styles.calloutTitle}>{strings.MoreToolsAriaLabel || 'More tools'}</h3>
            <div className={styles.moreToolsList}>
              {items.map((item) => (
                <div className={styles.moreToolsRow} key={item.key}>
                  <span className={styles.moreToolsLabel}>{item.label}</span>
                  {item.node}
                </div>
              ))}
            </div>
          </div>
        </PopoverSurface>
      </Popover>
    </div>
  );
};

export default React.memo(MoreToolsMenu);
