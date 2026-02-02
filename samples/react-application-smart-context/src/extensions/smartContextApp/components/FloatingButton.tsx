import * as React from 'react';
import { TooltipHost } from '@fluentui/react';
import { IFloatingButtonProps } from './IFloatingButtonProps';
import styles from './FloatingButton.module.scss';

export const FloatingButton: React.FC<IFloatingButtonProps> = (props) => {
  return (
    <div className={styles.tabContainer}>
      <TooltipHost content="Smart Context - AI insights for this page">
        <button 
          className={styles.sideTab} 
          onClick={props.onClick}
          aria-label="Open Smart Context"
        >
          {/* Fluent AI Sparkle Icon */}
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            className={styles.sparkleIcon}
          >
            <path 
              d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" 
              fill="currentColor"
            />
            <path 
              d="M19 14L19.75 16.25L22 17L19.75 17.75L19 20L18.25 17.75L16 17L18.25 16.25L19 14Z" 
              fill="currentColor"
              opacity="0.7"
            />
          </svg>
          <span className={styles.tabTextShort}>SC</span>
          <span className={styles.tabTextFull}>Smart Context</span>
        </button>
      </TooltipHost>
    </div>
  );
};
