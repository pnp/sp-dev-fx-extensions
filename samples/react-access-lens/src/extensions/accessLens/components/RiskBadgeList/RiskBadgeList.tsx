import * as React from 'react';
import { Text } from '@fluentui/react/lib/Text';
import { TooltipHost } from '@fluentui/react/lib/Tooltip';
import { Icon } from '@fluentui/react/lib/Icon';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';

import type { RiskIndicator } from '../../models/risk-indicator';
import strings from 'AccessLensCommandSetStrings';
import styles from './RiskBadgeList.module.scss';

export interface IRiskBadgeListProps {
  indicators: RiskIndicator[];
  isPartial: boolean;
}

export const RiskBadgeList: React.FC<IRiskBadgeListProps> = ({ indicators, isPartial }) => {
  return (
    <div>
      <Text variant="mediumPlus" block style={{ marginBottom: 8, fontWeight: 600 }}>
        {strings.RiskBadgesSectionTitle}
      </Text>
      {isPartial && (
        <MessageBar messageBarType={MessageBarType.warning} style={{ marginBottom: 8 }}>
          {strings.PartialRiskWarning}
        </MessageBar>
      )}
      {indicators.length === 0 && !isPartial && (
        <div style={{ color: '#605e5c', fontStyle: 'italic', fontSize: 13 }}>
          {strings.NoRiskIndicators}
        </div>
      )}
      {indicators.length > 0 && (
        <div className={styles.badgeList}>
        {indicators.map((indicator) => (
          <TooltipHost
            key={indicator.id}
            content={indicator.description}
            calloutProps={{ gapSpace: 4 }}
          >
            <span
              className={`${styles.badge} ${indicator.severity === 'warning' ? styles.warning : styles.info}`}
              role="status"
              aria-label={`${indicator.label}: ${indicator.description}`}
            >
              <Icon
                iconName={indicator.severity === 'warning' ? 'Warning' : 'Info'}
                className={styles.badgeIcon}
              />
              {indicator.label}
            </span>
          </TooltipHost>
        ))}
      </div>
      )}
    </div>
  );
};
