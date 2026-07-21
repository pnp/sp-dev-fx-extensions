import * as React from 'react';
import { Button, Tooltip } from '@fluentui/react-components';
import { WeatherSunny24Regular, WeatherMoon24Regular } from '@fluentui/react-icons';

import type { IHeaderStrings } from '../models/IHeaderStrings';
import { emitNavigationTelemetry } from '../utils/navigationTelemetry';
import styles from './HeaderTools.module.scss';

export interface IThemeSwitcherToolProps {
  strings: IHeaderStrings;
  isDark: boolean;
  onToggle: () => void;
}

const ThemeSwitcherTool: React.FC<IThemeSwitcherToolProps> = (props) => {
  const { strings, isDark, onToggle } = props;

  const label = isDark ? (strings.ThemeLightLabel || 'Light') : (strings.ThemeDarkLabel || 'Dark');

  return (
    <div className={styles.headerTool}>
      <Tooltip content={label} relationship="label">
        <Button
          className={styles.headerToolButton}
          icon={isDark ? <WeatherSunny24Regular /> : <WeatherMoon24Regular />}
          appearance="subtle"
          onClick={(): void => {
            onToggle();
            emitNavigationTelemetry({
              action: 'theme-toggle',
              level: 'service',
              metadata: { theme: isDark ? 'light' : 'dark' }
            });
          }}
          title={label}
        />
      </Tooltip>
    </div>
  );
};

export default React.memo(ThemeSwitcherTool);
