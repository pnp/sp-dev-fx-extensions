import * as React from 'react';

import type { PermissionInspectionResult } from '../../models/permission-inspection-result';
import strings from 'AccessLensCommandSetStrings';
import styles from './AdvancedDetails.module.scss';

export interface IAdvancedDetailsProps {
  result: PermissionInspectionResult;
}

export const AdvancedDetails: React.FC<IAdvancedDetailsProps> = ({ result }) => {
  const [expanded, setExpanded] = React.useState(false);

  const normalizedData = React.useMemo(() => {
    const data: Record<string, unknown> = {
      context: result.context,
      effectivePermissionSource: result.effectivePermissionSource,
      webAssignments: result.webAssignments,
      libraryAssignments: result.libraryAssignments,
      effectiveAssignments: result.effectiveAssignments,
      riskIndicators: result.riskIndicators,
      summary: result.summary,
      errors: result.errors,
      isPartial: result.isPartial,
    };

    if (result.isDebugMode && result.advancedRaw) {
      data.advancedRaw = result.advancedRaw;
    }

    return JSON.stringify(data, null, 2);
  }, [result]);

  return (
    <div>
      <button
        className={styles.toggle}
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <span>{expanded ? '▾' : '▸'}</span>
        {strings.AdvancedDetailsSectionTitle}
      </button>

      {expanded && (
        <div className={styles.detailsSection}>
          {result.isDebugMode && (
            <span className={styles.debugBadge}>{strings.DebugModeActive}</span>
          )}
          <div className={styles.jsonContainer}>
            <pre>{normalizedData}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
