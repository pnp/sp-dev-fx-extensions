import * as React from 'react';
import { Link, Icon } from '@fluentui/react';
import styles from '../SmartContextContent.module.scss';
import { getContentIconFromUrl } from './iconUtils';
import { IAttribution } from '../../services/ICopilotService';

export interface IAttributionItemProps {
  item: IAttribution;
  index: number;
}

export const AttributionItem: React.FC<IAttributionItemProps> = ({ item, index }) => {
  return (
    <div 
      className={styles.contentCard}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={styles.contentIcon}>
        <Icon iconName={getContentIconFromUrl(item.seeMoreWebUrl)} />
      </div>
      <Link 
        href={item.seeMoreWebUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        data-interception="off"
        className={styles.contentText}
        title={item.seeMoreWebUrl}
      >
        {item.providerDisplayName || 'View Source'}
      </Link>
    </div>
  );
};
