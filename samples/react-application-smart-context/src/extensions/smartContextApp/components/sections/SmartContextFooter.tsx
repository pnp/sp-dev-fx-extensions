import * as React from 'react';
import { Text, Icon } from '@fluentui/react';
import styles from '../SmartContextContent.module.scss';

export const SmartContextFooter: React.FC = () => {
  return (
    <div className={styles.footer}>
      <Icon iconName="Shield" className={styles.footerIcon} />
      <Text className={styles.footerText}>
        Data sourced from your personal Microsoft 365 content
      </Text>
    </div>
  );
};
