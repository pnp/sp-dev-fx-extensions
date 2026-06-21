import * as React from 'react';
import { Text } from '@fluentui/react/lib/Text';

import type { EffectivePermissionSource } from '../../models/permission-inspection-result';
import strings from 'AccessLensCommandSetStrings';
import styles from './EffectivePermissionSourceCard.module.scss';

export interface IEffectivePermissionSourceCardProps {
  source: EffectivePermissionSource;
}

function getSourceLabel(source: EffectivePermissionSource): string {
  switch (source) {
    case 'web': return strings.ScopeWeb;
    case 'library': return strings.ScopeLibrary;
    default: return strings.ExternalUnknown;
  }
}

function getSourceExplanation(source: EffectivePermissionSource): string {
  switch (source) {
    case 'web': return strings.EffectiveSourceWeb;
    case 'library': return strings.EffectiveSourceLibrary;
    default: return strings.EffectiveSourceUnknown;
  }
}

export const EffectivePermissionSourceCard: React.FC<IEffectivePermissionSourceCardProps> = ({ source }) => {
  return (
    <div>
      <Text variant="mediumPlus" block style={{ marginBottom: 8, fontWeight: 600 }}>
        {strings.EffectivePermissionSourceSectionTitle}
      </Text>
      <div className={styles.sourceCard}>
        <div className={styles.sourceValue}>
          {strings.EffectiveSourceLabelPrefix} {getSourceLabel(source)}
        </div>
        <div className={styles.sourceExplanation}>
          {getSourceExplanation(source)}
        </div>
      </div>
    </div>
  );
};
