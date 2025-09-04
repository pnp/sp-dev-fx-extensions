import * as React from 'react';
import styles from './LinkBadge.module.scss';

export interface ILinkBadgeProps {
  type: 'new' | 'updated' | 'popular' | 'urgent';
  text?: string;
}

export const LinkBadge: React.FC<ILinkBadgeProps> = ({ type, text }) => {
  const getBadgeText = () => {
    switch (type) {
      case 'new': return text || 'NEW';
      case 'updated': return text || '!';
      case 'popular': return text || '★';
      case 'urgent': return text || '⚠';
      default: return text || '';
    }
  };

  return (
    <div className={`${styles.linkBadge} ${styles[type]}`}>
      {getBadgeText()}
    </div>
  );
};