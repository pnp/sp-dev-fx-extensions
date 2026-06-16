import * as React from 'react';
import { Text } from '@fluentui/react/lib/Text';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';

import type { AccessSummary } from '../../models/permission-inspection-result';
import strings from 'AccessLensCommandSetStrings';
import styles from './AccessSummaryCard.module.scss';

export interface IAccessSummaryCardProps {
  summary: AccessSummary;
  isPartial: boolean;
}

export const AccessSummaryCard: React.FC<IAccessSummaryCardProps> = ({ summary, isPartial }) => {
  return (
    <div>
      <Text variant="mediumPlus" block style={{ marginBottom: 8, fontWeight: 600 }}>
        {strings.AccessSummarySectionTitle}
      </Text>
      {isPartial && (
        <MessageBar messageBarType={MessageBarType.warning} style={{ marginBottom: 8 }}>
          {strings.PartialSummaryWarning}
        </MessageBar>
      )}
      <div className={styles.summaryCard}>
        <table role="presentation">
          <tbody>
            <tr><th scope="row">{strings.SummaryEffectiveSource}</th><td>{summary.effectivePermissionSource}</td></tr>
            <tr><th scope="row">{strings.SummaryTotalAssignments}</th><td>{summary.totalAssignments}</td></tr>
            <tr><th scope="row">{strings.SummaryEffectiveAssignments}</th><td>{summary.effectiveAssignments}</td></tr>
            <tr><th scope="row">{strings.SummaryWebAssignments}</th><td>{summary.webAssignments}</td></tr>
            <tr><th scope="row">{strings.SummaryLibraryAssignments}</th><td>{summary.libraryAssignments}</td></tr>
            <tr><th scope="row">{strings.SummarySharePointGroups}</th><td>{summary.sharePointGroups}</td></tr>
            <tr><th scope="row">{strings.SummaryDirectUsers}</th><td>{summary.directUsers}</td></tr>
            <tr><th scope="row">{strings.SummarySecurityClaimPrincipals}</th><td>{summary.securityOrClaimPrincipals}</td></tr>
            <tr><th scope="row">{strings.SummaryExternalPrincipals}</th><td>{summary.externalPrincipals}</td></tr>
            <tr><th scope="row">{strings.SummaryBroadAccessPrincipals}</th><td>{summary.broadAccessPrincipals}</td></tr>
            {summary.limitedAccessAssignments > 0 && (
              <tr><th scope="row">{strings.SummaryLimitedAccess}</th><td>{summary.limitedAccessAssignments}</td></tr>
            )}
            {summary.roleNames.length > 0 && (
              <tr><th scope="row">{strings.SummaryRoleLevels}</th><td>{summary.roleNames.join(', ')}</td></tr>
            )}
            <tr>
              <th scope="row">{strings.SummaryInspectionState}</th>
              <td>{isPartial ? strings.SummaryPartial : strings.SummaryComplete}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
