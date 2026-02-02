import * as React from 'react';
import { Text, Link, Icon } from '@fluentui/react';
import styles from '../SmartContextContent.module.scss';
import { getRoleIcon, ROLE_DEFINITIONS } from './iconUtils';
import { IMyRole } from '../../services/ICopilotService';

export interface IMyRoleCardProps {
  myRole: IMyRole;
}

/**
 * Parses markdown **bold** syntax and renders as <strong> elements
 */
const parseMarkdownBold = (text: string): React.ReactNode[] => {
  // Split by **text** pattern, keeping the captured content
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Remove ** and wrap in strong
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className={styles.reasonHighlight}>
          {boldText}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

export const MyRoleCard: React.FC<IMyRoleCardProps> = ({ myRole }) => {
  const [showRoleLegend, setShowRoleLegend] = React.useState(false);

  return (
    <div className={styles.myRoleCard}>
      <div className={styles.myRoleIconWrapper}>
        <Icon iconName={getRoleIcon(myRole.role)} className={styles.myRoleIcon} />
      </div>
      <div className={styles.myRoleContent}>
        <div className={styles.myRoleTitleRow}>
          <Text className={styles.myRoleLabel}>How This Relates to You</Text>
          <Link 
            onClick={(e) => { e.preventDefault(); setShowRoleLegend(!showRoleLegend); }}
            className={styles.legendToggle}
          >
            <Icon iconName={showRoleLegend ? 'ChevronUp' : 'Info'} />
            <Text>{showRoleLegend ? 'Hide legend' : 'What does this mean?'}</Text>
          </Link>
        </div>
        <Text className={styles.myRoleValue}>{myRole.role}</Text>
        <Text className={styles.myRoleReason}>{parseMarkdownBold(myRole.reason)}</Text>
      </div>
      {showRoleLegend && (
        <div className={styles.roleLegend}>
          <Text className={styles.legendTitle}>All possible relations:</Text>
          {ROLE_DEFINITIONS.map((def, index) => (
            <div 
              key={index} 
              className={`${styles.legendItem} ${myRole.role === def.role ? styles.legendItemActive : ''}`}
            >
              <Icon iconName={def.icon} className={styles.legendIcon} />
              <div className={styles.legendText}>
                <Text className={styles.legendRole}>{def.role}</Text>
                <Text className={styles.legendDesc}>{def.description}</Text>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
