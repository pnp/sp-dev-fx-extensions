import * as React from 'react';
import { Button, Popover, PopoverTrigger, PopoverSurface } from '@fluentui/react-components';
import { Print24Regular } from '@fluentui/react-icons';

import type { IHeaderStrings } from '../models/IHeaderStrings';
import { emitNavigationTelemetry } from '../utils/navigationTelemetry';
import { reportError } from '../utils/errorReporting';
import styles from './HeaderTools.module.scss';

export interface IPrintShareToolProps {
  strings: IHeaderStrings;
  
  inline?: boolean;
}

const PrintShareTool: React.FC<IPrintShareToolProps> = (props) => {
  const { strings, inline } = props;
  const [open, setOpen] = React.useState(false);

  const handlePrint = React.useCallback((): void => {
    emitNavigationTelemetry({ action: 'print', level: 'service' });
    setOpen(false);
    window.print();
  }, []);

  const handleShare = React.useCallback((): void => {
    emitNavigationTelemetry({ action: 'share', level: 'service' });
    setOpen(false);

    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href
      }).catch((error: unknown) => {

        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        reportError(error, { action: 'share-failed', level: 'service' });
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch((error: unknown) => {
        reportError(error, { action: 'clipboard-copy-failed', level: 'service' });
      });
    }
  }, []);

  return (
    <div className={styles.headerTool}>
      <Popover open={open} onOpenChange={(e, data) => setOpen(data.open)} inline={inline}>
        <PopoverTrigger>
          <Button
            className={styles.headerToolButton}
            icon={<Print24Regular />}
            appearance="subtle"
            title={strings.PrintAriaLabel || 'Print or share'}
          />
        </PopoverTrigger>
        <PopoverSurface className={styles.quickActionsCallout}>
          <div className={styles.quickActionsContent}>
            <h3 className={styles.calloutTitle}>{strings.PrintAriaLabel || 'Print or share'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button className={styles.quickActionItem} onClick={handlePrint} type="button">
                <span>{strings.PrintAriaLabel || 'Print'}</span>
              </button>
              <button className={styles.quickActionItem} onClick={handleShare} type="button">
                <span>{strings.ShareAriaLabel || 'Share'}</span>
              </button>
            </div>
          </div>
        </PopoverSurface>
      </Popover>
    </div>
  );
};

export default React.memo(PrintShareTool);
