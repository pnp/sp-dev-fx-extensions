import * as React from 'react';
import { Button, Popover, PopoverTrigger, PopoverSurface, Slider, Switch } from '@fluentui/react-components';
import { Accessibility24Regular } from '@fluentui/react-icons';

import type { IHeaderStrings } from '../models/IHeaderStrings';
import { emitNavigationTelemetry } from '../utils/navigationTelemetry';
import styles from './HeaderTools.module.scss';

export interface IAccessibilityToolProps {
  strings: IHeaderStrings;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  fontScale: number;
  onChangeFontScale: (value: number) => void;
  
  inline?: boolean;
}

const AccessibilityTool: React.FC<IAccessibilityToolProps> = (props) => {
  const { strings, isHighContrast, onToggleHighContrast, fontScale, onChangeFontScale, inline } = props;
  const [open, setOpen] = React.useState(false);

  const handleScaleChange = React.useCallback(
    (e: unknown, data: { value: number }): void => {
      onChangeFontScale(data.value);
      emitNavigationTelemetry({
        action: 'accessibility-font-scale',
        level: 'service',
        metadata: { scale: data.value }
      });
    },
    [onChangeFontScale]
  );

  const handleToggle = React.useCallback((): void => {
    onToggleHighContrast();
    emitNavigationTelemetry({
      action: 'accessibility-high-contrast',
      level: 'service',
      metadata: { enabled: !isHighContrast }
    });
  }, [isHighContrast, onToggleHighContrast]);

  return (
    <div className={styles.headerTool}>
      <Popover open={open} onOpenChange={(e, data) => setOpen(data.open)} inline={inline}>
        <PopoverTrigger>
          <Button
            className={styles.headerToolButton}
            icon={<Accessibility24Regular />}
            appearance="subtle"
            onClick={() => setOpen(!open)}
            title={strings.AccessibilityToolsAriaLabel || 'Accessibility tools'}
          />
        </PopoverTrigger>

        <PopoverSurface className={styles.quickActionsCallout}>
          <div className={styles.quickActionsContent}>
            <h3 className={styles.calloutTitle}>{strings.AccessibilityToolsAriaLabel || 'Accessibility'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Switch
                checked={isHighContrast}
                label={strings.HighContrastLabel || 'High contrast'}
                onChange={handleToggle}
              />
              <div>
                <label className={styles.accessibilityLabel} htmlFor="font-size-slider">
                  {strings.TextSizeLabel || 'Text size'}
                </label>
                <Slider
                  id="font-size-slider"
                  max={150}
                  min={80}
                  step={10}
                  value={fontScale}
                  onChange={handleScaleChange}
                />
                <span className={styles.accessibilityValue}>{fontScale}%</span>
              </div>
            </div>
          </div>
        </PopoverSurface>
      </Popover>
    </div>
  );
};

export default React.memo(AccessibilityTool);
