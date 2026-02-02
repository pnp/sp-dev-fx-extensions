import * as React from 'react';
import { Text } from '@fluentui/react';
import styles from '../SmartContextContent.module.scss';

export const SmartContextHeader: React.FC = () => {
  return (
    <div className={styles.header}>
      <div className={styles.aiBadge}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path 
            d="M12 2L14.4 8.8L21.6 9.6L16.2 14.4L17.8 21.6L12 18L6.2 21.6L7.8 14.4L2.4 9.6L9.6 8.8L12 2Z" 
            fill="url(#sparkleGrad)"
          />
          <defs>
            <linearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7B61FF" />
              <stop offset="100%" stopColor="#00BCF2" />
            </linearGradient>
          </defs>
        </svg>
        <Text className={styles.aiBadgeText}>AI Generated</Text>
      </div>
      <Text className={styles.headerTitle}>Smart Context</Text>
      <Text className={styles.headerSubtitle}>
        Personalized insights powered by your Microsoft 365 data
      </Text>
    </div>
  );
};
