import * as React from 'react';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { IconButton } from '@fluentui/react/lib/Button';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { Text } from '@fluentui/react/lib/Text';
import type { SPFI } from '@pnp/sp';

import type { UserInfo } from '../../models/access-lens-context';
import type { PermissionInspectionResult } from '../../models/permission-inspection-result';
import { createPermissionService } from '../../services/sharepoint-permission-service';
import { createGroupExpansionService, type GroupExpansionService } from '../../services/group-expansion-service';
import { createAccessInspectionService } from '../../services/access-inspection-service';
import { CurrentContextCard } from '../CurrentContextCard/CurrentContextCard';
import { InspectionStateMessage } from '../InspectionStateMessage/InspectionStateMessage';
import { RiskBadgeList } from '../RiskBadgeList/RiskBadgeList';
import { InheritanceSummary } from '../InheritanceSummary/InheritanceSummary';
import { EffectivePermissionSourceCard } from '../EffectivePermissionSourceCard/EffectivePermissionSourceCard';
import { AccessSummaryCard } from '../AccessSummaryCard/AccessSummaryCard';
import { RoleAssignmentsTable } from '../RoleAssignmentsTable/RoleAssignmentsTable';
import { AdvancedDetails } from '../AdvancedDetails/AdvancedDetails';
import { ExportActions } from '../ExportActions/ExportActions';
import strings from 'AccessLensCommandSetStrings';
import styles from './AccessLensPanel.module.scss';

export interface IAccessLensPanelProps {
  sp: SPFI;
  listId: string;
  webServerRelativeUrl: string;
  siteServerRelativeUrl: string;
  webAbsoluteUrl: string;
  currentUser?: UserInfo;
  isDebugMode: boolean;
  onDismiss: () => void;
  /** Element to return focus to after the panel closes (Sec. 20). */
  returnFocusTarget?: HTMLElement;
}

type LoadState = 'loading' | 'loaded' | 'failed';

export const AccessLensPanel: React.FC<IAccessLensPanelProps> = (props) => {
  const { sp, listId, webServerRelativeUrl, siteServerRelativeUrl, webAbsoluteUrl, currentUser, isDebugMode, onDismiss, returnFocusTarget } = props;

  const [loadState, setLoadState] = React.useState<LoadState>('loading');
  const [result, setResult] = React.useState<PermissionInspectionResult | undefined>();
  const groupExpansionServiceRef = React.useRef<GroupExpansionService | undefined>();

  // Create services on mount
  React.useEffect(() => {
    groupExpansionServiceRef.current = createGroupExpansionService(sp);
  }, [sp]);

  const runInspection = React.useCallback(async () => {
    setLoadState('loading');
    setResult(undefined);

    const permissionService = createPermissionService(sp);
    const inspectionService = createAccessInspectionService(permissionService, sp);

    try {
      const inspectionResult = await inspectionService.runInspection({
        listId,
        webServerRelativeUrl,
        siteServerRelativeUrl,
        webAbsoluteUrl,
        currentUser,
        isDebugMode,
      });
      setResult(inspectionResult);
      setLoadState('loaded');
    } catch {
      setLoadState('failed');
    }
  }, [sp, listId, webServerRelativeUrl, siteServerRelativeUrl, webAbsoluteUrl, currentUser, isDebugMode]);

  // Run inspection on mount
  React.useEffect(() => {
    runInspection().catch(() => { /* handled in runInspection */ });
  }, [runInspection]);

  const handleRefresh = React.useCallback(() => {
    groupExpansionServiceRef.current?.clearCache();
    runInspection().catch(() => { /* handled in runInspection */ });
  }, [runInspection]);

  const onRenderHeader = React.useCallback((): JSX.Element => (
    <div style={{ padding: '16px 16px 0', flex: 1 }}>
      <div className={styles.header}>
        <Text variant="xLarge" block>{strings.PanelTitle}</Text>
        <div className={styles.headerActions}>
          <IconButton
            iconProps={{ iconName: 'Refresh' }}
            title={strings.RefreshLabel}
            ariaLabel={strings.RefreshLabel}
            onClick={handleRefresh}
            disabled={loadState === 'loading'}
          />
        </div>
      </div>
      <Text className={styles.subtitle} block>{strings.PanelSubtitle}</Text>
    </div>
  ), [handleRefresh, loadState]);

  const handleDismissed = React.useCallback(() => {
    if (returnFocusTarget) {
      returnFocusTarget.focus();
    }
  }, [returnFocusTarget]);

  return (
    <Panel
      isOpen={true}
      type={PanelType.medium}
      onDismiss={onDismiss}
      onDismissed={handleDismissed}
      onRenderHeader={onRenderHeader}
      isLightDismiss={false}
      closeButtonAriaLabel={strings.CloseLabel}
      className={styles.panel}
    >
      {loadState === 'loading' && (
        <div className={styles.section}>
          <Spinner size={SpinnerSize.large} label={strings.Loading} />
        </div>
      )}

      {loadState === 'failed' && !result && (
        <div className={styles.section}>
          <InspectionStateMessage
            loadState="failed"
            errors={[]}
            isPartial={true}
          />
        </div>
      )}

      {result && (
        <>
          <div className={styles.section}>
            <CurrentContextCard context={result.context} />
          </div>

          <div className={styles.section}>
            <InspectionStateMessage
              loadState={loadState}
              errors={result.errors}
              isPartial={result.isPartial}
            />
          </div>

          <div className={styles.section}>
            <RiskBadgeList indicators={result.riskIndicators} isPartial={result.isPartial} />
          </div>

          <div className={styles.section}>
            <InheritanceSummary context={result.context} />
          </div>

          <div className={styles.section}>
            <EffectivePermissionSourceCard
              source={result.effectivePermissionSource}
            />
          </div>

          <div className={styles.section}>
            <AccessSummaryCard summary={result.summary} isPartial={result.isPartial} />
          </div>

          <div className={styles.section}>
            <RoleAssignmentsTable
              webAssignments={result.webAssignments}
              libraryAssignments={result.libraryAssignments}
              groupExpansionService={groupExpansionServiceRef.current}
            />
          </div>

          <div className={styles.section}>
            <AdvancedDetails result={result} />
          </div>

          <div className={styles.section}>
            <ExportActions result={result} />
          </div>
        </>
      )}
    </Panel>
  );
};
