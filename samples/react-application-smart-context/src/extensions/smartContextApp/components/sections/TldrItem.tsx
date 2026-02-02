import * as React from 'react';
import { Text, Icon } from '@fluentui/react';
import styles from '../SmartContextContent.module.scss';

export interface ITldrItemProps {
  item: string;
  index: number;
}

export const TldrItem: React.FC<ITldrItemProps> = ({ item, index }) => {
  return (
    <div 
      className={styles.tldrItem}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className={styles.tldrBullet}>
        <Icon iconName="StatusCircleCheckmark" />
      </div>
      <Text className={styles.tldrText}>{item}</Text>
    </div>
  );
};
