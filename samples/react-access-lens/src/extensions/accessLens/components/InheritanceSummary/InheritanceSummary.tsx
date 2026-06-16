import * as React from 'react';
import { Text } from '@fluentui/react/lib/Text';

import type { AccessLensContext } from '../../models/access-lens-context';
import strings from 'AccessLensCommandSetStrings';
import styles from './InheritanceSummary.module.scss';

export interface IInheritanceSummaryProps {
  context: AccessLensContext;
}

function formatWebInheritance(status: string): string {
  switch (status) {
    case 'rootWeb': return strings.InheritanceRootWeb;
    case 'inheritsFromParentWeb': return strings.InheritanceFromParentWeb;
    case 'hasUniquePermissions': return strings.InheritanceWebUnique;
    default: return strings.InheritanceUnknown;
  }
}

function formatLibraryInheritance(status: string): string {
  switch (status) {
    case 'inheritsFromCurrentWeb': return strings.InheritanceLibraryFromWeb;
    case 'hasUniquePermissions': return strings.InheritanceLibraryUnique;
    default: return strings.InheritanceUnknown;
  }
}

export const InheritanceSummary: React.FC<IInheritanceSummaryProps> = ({ context }) => {
  return (
    <div>
      <Text variant="mediumPlus" block style={{ marginBottom: 8, fontWeight: 600 }}>
        {strings.PermissionInheritanceSectionTitle}
      </Text>
      <div className={styles.inheritanceCard}>
        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>{strings.WebPermissionsLabel}:</span>
          <span className={styles.statusValue}>
            {formatWebInheritance(context.web.inheritanceStatus)}
          </span>
        </div>
        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>{strings.LibraryPermissionsLabel}:</span>
          <span className={styles.statusValue}>
            {formatLibraryInheritance(context.library.inheritanceStatus)}
          </span>
        </div>
        <div className={styles.explanation}>
          {strings.InheritanceExplanation}
        </div>
      </div>
    </div>
  );
};
