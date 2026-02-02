import * as React from 'react';
import { Text, Icon } from '@fluentui/react';
import styles from '../SmartContextContent.module.scss';
import { getSourceIcon } from './iconUtils';
import { ITimelineEvent } from '../../services/ICopilotService';

export interface ITimelineItemProps {
  event: ITimelineEvent;
  index: number;
  isLast: boolean;
}

export const TimelineItem: React.FC<ITimelineItemProps> = ({ event, index, isLast }) => {
  return (
    <div 
      className={styles.timelineItem}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className={styles.timelineMarker}>
        <div className={styles.timelineDot} />
        {!isLast && <div className={styles.timelineLine} />}
      </div>
      <div className={styles.timelineContent}>
        <div className={styles.timelineHeader}>
          <Text className={styles.timelineDate}>{event.date}</Text>
          <div className={styles.timelineSource}>
            <Icon iconName={getSourceIcon(event.source)} />
            <Text>{event.source}</Text>
          </div>
        </div>
        <Text className={styles.timelineEvent}>{event.event}</Text>
      </div>
    </div>
  );
};
