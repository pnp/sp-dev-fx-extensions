import * as React from 'react';
import { Text, Icon } from '@fluentui/react';
import styles from '../SmartContextContent.module.scss';
import { IPendingAction } from '../../services/ICopilotService';

export interface IPendingActionItemProps {
  action: IPendingAction;
  index: number;
}

const getUrgencyClass = (urgency: string): string => {
  switch (urgency) {
    case 'high': return styles.urgencyHigh;
    case 'medium': return styles.urgencyMedium;
    default: return styles.urgencyLow;
  }
};

export const PendingActionItem: React.FC<IPendingActionItemProps> = ({ action, index }) => {
  return (
    <div 
      className={`${styles.actionCard} ${getUrgencyClass(action.urgency)}`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className={styles.actionHeader}>
        <div className={`${styles.urgencyBadge} ${getUrgencyClass(action.urgency)}`}>
          <Icon iconName={action.urgency === 'high' ? 'Warning' : action.urgency === 'medium' ? 'Clock' : 'Info'} />
          <Text>{action.urgency.toUpperCase()}</Text>
        </div>
        {action.dueDate && (
          <Text className={styles.actionDueDate}>
            <Icon iconName="Calendar" /> {action.dueDate}
          </Text>
        )}
      </div>
      <Text className={styles.actionText}>{action.action}</Text>
    </div>
  );
};
