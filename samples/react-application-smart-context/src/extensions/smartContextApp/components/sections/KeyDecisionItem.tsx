import * as React from 'react';
import { Text, Icon } from '@fluentui/react';
import styles from '../SmartContextContent.module.scss';
import { IKeyDecision } from '../../services/ICopilotService';

export interface IKeyDecisionItemProps {
  decision: IKeyDecision;
  index: number;
}

export const KeyDecisionItem: React.FC<IKeyDecisionItemProps> = ({ decision, index }) => {
  return (
    <div 
      className={styles.decisionCard}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className={styles.decisionIcon}>
        <Icon iconName="DecisionSolid" />
      </div>
      <div className={styles.decisionContent}>
        <Text className={styles.decisionText}>{decision.decision}</Text>
      </div>
    </div>
  );
};
