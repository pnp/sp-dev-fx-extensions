import * as React from 'react';
import { Text, Link, Icon } from '@fluentui/react';
import styles from '../SmartContextContent.module.scss';

export interface ISectionProps {
  title: string;
  icon: string;
  description: string;
  items: React.ReactElement[];
  isEmpty: boolean;
  className: string;
  animationIndex: number;
  showMoreButton?: {
    hasMore: boolean;
    isExpanded: boolean;
    onToggle: () => void;
    remainingCount: number;
  };
}

export const Section: React.FC<ISectionProps> = ({
  title,
  icon,
  description,
  items,
  isEmpty,
  className,
  animationIndex,
  showMoreButton
}) => {
  return (
    <div 
      className={`${styles.section} ${className}`}
      style={{ animationDelay: `${animationIndex * 0.15}s` }}
    >
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIconWrapper}>
          <Icon iconName={icon} className={styles.sectionIcon} />
        </div>
        <div className={styles.sectionTitleGroup}>
          <Text className={styles.sectionTitle}>{title}</Text>
          <Text className={styles.sectionDescription}>{description}</Text>
        </div>
      </div>
      
      <div className={styles.sectionContent}>
        {isEmpty ? (
          <div className={styles.emptyState}>
            <Icon iconName="Info" className={styles.emptyIcon} />
            <Text className={styles.emptyText}>No relevant data found</Text>
          </div>
        ) : (
          <>
            <div className={styles.itemsContainer}>
              {items}
            </div>
            {showMoreButton && showMoreButton.hasMore && (
              <div className={styles.showMoreContainer}>
                <Link 
                  onClick={(e) => {
                    e.preventDefault();
                    showMoreButton.onToggle();
                  }}
                  className={styles.showMoreLink}
                >
                  <Icon iconName={showMoreButton.isExpanded ? 'ChevronUp' : 'ChevronDown'} className={styles.showMoreIcon} />
                  <Text>
                    {showMoreButton.isExpanded 
                      ? 'Show less' 
                      : `Show ${showMoreButton.remainingCount} more`}
                  </Text>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
