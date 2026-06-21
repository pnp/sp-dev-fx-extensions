import * as React from 'react';
import { Text } from '@fluentui/react/lib/Text';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';

import type { RoleAssignmentInfo, GroupMemberInfo } from '../../models/role-assignment-info';
import type { GroupExpansionService } from '../../services/group-expansion-service';
import strings from 'AccessLensCommandSetStrings';
import styles from './RoleAssignmentsTable.module.scss';

export interface IRoleAssignmentsTableProps {
  webAssignments: RoleAssignmentInfo[];
  libraryAssignments: RoleAssignmentInfo[];
  groupExpansionService?: GroupExpansionService;
}

interface GroupState {
  expanded: boolean;
  loading: boolean;
  members?: GroupMemberInfo[];
  error?: string;
}

export const RoleAssignmentsTable: React.FC<IRoleAssignmentsTableProps> = ({
  webAssignments,
  libraryAssignments,
  groupExpansionService,
}) => {
  const allAssignments = React.useMemo(
    () => [...libraryAssignments, ...webAssignments],
    [webAssignments, libraryAssignments]
  );

  const [groupStates, setGroupStates] = React.useState<Record<number, GroupState>>({});

  const handleExpandGroup = React.useCallback(async (principalId: number) => {
    const current = groupStates[principalId];
    if (current?.expanded) {
      setGroupStates(prev => ({
        ...prev,
        [principalId]: { ...prev[principalId], expanded: false },
      }));
      return;
    }

    if (current?.members) {
      setGroupStates(prev => ({
        ...prev,
        [principalId]: { ...prev[principalId], expanded: true },
      }));
      return;
    }

    if (!groupExpansionService) return;

    setGroupStates(prev => ({
      ...prev,
      [principalId]: { expanded: true, loading: true },
    }));

    try {
      const members = await groupExpansionService.getGroupMembers(principalId);
      setGroupStates(prev => ({
        ...prev,
        [principalId]: { expanded: true, loading: false, members },
      }));
    } catch {
      setGroupStates(prev => ({
        ...prev,
        [principalId]: {
          expanded: true,
          loading: false,
          error: strings.GroupMembersLoadFailed,
        },
      }));
    }
  }, [groupStates, groupExpansionService]);

  if (allAssignments.length === 0) {
    return (
      <div>
        <Text variant="mediumPlus" block style={{ marginBottom: 8, fontWeight: 600 }}>
          {strings.RoleAssignmentsSectionTitle}
        </Text>
        <div className={styles.noAssignments}>{strings.NoAssignmentsFound}</div>
      </div>
    );
  }

  return (
    <div>
      <Text variant="mediumPlus" block style={{ marginBottom: 8, fontWeight: 600 }}>
        {strings.RoleAssignmentsSectionTitle}
      </Text>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">{strings.ColumnScope}</th>
            <th scope="col">{strings.ColumnEffective}</th>
            <th scope="col">{strings.ColumnPrincipal}</th>
            <th scope="col">{strings.ColumnType}</th>
            <th scope="col">{strings.ColumnRoles}</th>
            <th scope="col">{strings.ColumnExternal}</th>
            <th scope="col">{strings.ColumnNotes}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {allAssignments.map((assignment) => {
            const groupState = groupStates[assignment.principalId];
            const isSharePointGroup = assignment.principalKind === 'sharePointGroup';
            const rowClass = assignment.isEffective ? styles.effectiveRow : styles.nonEffectiveRow;

            return (
              <React.Fragment key={`${assignment.scope}-${assignment.principalId}`}>
                <tr className={rowClass}>
                  <td>{assignment.scope === 'web' ? strings.ScopeWeb : strings.ScopeLibrary}</td>
                  <td>{assignment.isEffective ? strings.EffectiveYes : strings.EffectiveNo}</td>
                  <td>{assignment.principalTitle}</td>
                  <td>{formatPrincipalKind(assignment.principalKind)}</td>
                  <td>{assignment.roleDefinitions.map(rd => rd.name).join(', ')}</td>
                  <td>{formatExternal(assignment.isExternal)}</td>
                  <td>{renderNotes(assignment.notes, assignment)}</td>
                  <td>
                    {isSharePointGroup && (
                      <button
                        className={styles.expandButton}
                        onClick={() => { handleExpandGroup(assignment.principalId).catch(() => { /* handled */ }); }}
                        aria-label={groupState?.expanded ? strings.CollapseGroupLabel : strings.ExpandGroupLabel}
                        aria-expanded={groupState?.expanded ?? false}
                      >
                        {groupState?.expanded ? '▾' : '▸'}
                      </button>
                    )}
                  </td>
                </tr>

                {isSharePointGroup && groupState?.expanded && (
                  <tr className={styles.groupMembersRow}>
                    <td colSpan={8}>
                      <div className={styles.groupMembersContent}>
                        {groupState.loading && (
                          <Spinner size={SpinnerSize.small} label={strings.Loading} />
                        )}
                        {groupState.error && (
                          <MessageBar messageBarType={MessageBarType.warning}>
                            {groupState.error}
                          </MessageBar>
                        )}
                        {groupState.members && groupState.members.length === 0 && !groupState.error && (
                          <div className={styles.loadingMembers}>{strings.GroupEmptyOrNoPermission}</div>
                        )}
                        {groupState.members && groupState.members.length > 0 && (
                          <>
                            <div className={styles.loadingMembers}>
                              {strings.LoadedMembersCount.replace('{0}', String(groupState.members.length))}
                            </div>
                            <table className={styles.memberTable}>
                              <thead>
                              <tr>
                                  <th scope="col">{strings.MemberColumnName}</th>
                                  <th scope="col">{strings.MemberColumnEmail}</th>
                                  <th scope="col">{strings.MemberColumnLoginName}</th>
                                  <th scope="col">{strings.ColumnType}</th>
                                  <th scope="col">{strings.ColumnExternal}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {groupState.members.map((member) => (
                                  <tr key={member.id}>
                                    <td>{member.title}</td>
                                    <td>{member.email ?? ''}</td>
                                    <td>{member.loginName ?? ''}</td>
                                    <td>{formatPrincipalKind(member.principalKind)}</td>
                                    <td>{formatExternal(member.isExternal)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

function formatPrincipalKind(kind: string): string {
  switch (kind) {
    case 'user': return strings.PrincipalKindUser;
    case 'sharePointGroup': return strings.PrincipalKindSharePointGroup;
    case 'securityGroup': return strings.PrincipalKindSecurityGroup;
    case 'distributionList': return strings.PrincipalKindDistributionList;
    case 'claim': return strings.PrincipalKindClaim;
    default: return strings.PrincipalKindUnknown;
  }
}

function formatExternal(isExternal?: boolean): string {
  if (isExternal === true) return strings.ExternalYes;
  if (isExternal === false) return strings.ExternalNo;
  return strings.ExternalUnknown;
}

function renderNotes(notes: string[], assignment: RoleAssignmentInfo): JSX.Element {
  const tags: JSX.Element[] = [];

  if (assignment.isExternal === true) {
    tags.push(
      <span key="ext" className={`${styles.noteTag} ${styles.noteExternal}`}>
        {strings.NoteExternalLooking}
      </span>
    );
  }

  if (assignment.isBroadAccess === true) {
    tags.push(
      <span key="broad" className={`${styles.noteTag} ${styles.noteBroad}`}>
        {strings.NoteBroadAccess}
      </span>
    );
  }

  // Show remaining notes as text
  const textNotes = notes.filter(n =>
    !n.startsWith('External-looking') && !n.startsWith('Broad access')
  );

  return (
    <>
      {tags}
      {textNotes.length > 0 && <span style={{ fontSize: 11 }}>{textNotes.join('; ')}</span>}
    </>
  );
}
