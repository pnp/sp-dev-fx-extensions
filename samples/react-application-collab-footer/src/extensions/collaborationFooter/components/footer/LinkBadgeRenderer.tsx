import * as React from 'react';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { LinkBadge } from '../shared/LinkBadge';

export interface IEnhancedContextualMenuItem extends IContextualMenuItem {
  badge?: 'new' | 'updated' | 'popular' | 'urgent';
  lastUpdated?: Date;
  clickCount?: number;
}

export interface ILinkBadgeRendererProps {
  link: IContextualMenuItem;
}

export const LinkBadgeRenderer: React.FC<ILinkBadgeRendererProps> = ({ link }) => {
  const enhancedLink = link as IEnhancedContextualMenuItem;
  
  const renderLinkBadge = (link: IEnhancedContextualMenuItem): React.ReactNode => {
    // Check if it's a mandatory organization link
    const isMandatory = (link.data as any)?.isMandatory;
    if (isMandatory) {
      return <LinkBadge type="urgent" text="Mandatory" />;
    }

    // Check for custom badges
    if (enhancedLink.badge) {
      const badgeLabels = {
        new: 'New',
        updated: 'Updated', 
        popular: 'Popular',
        urgent: 'Urgent'
      };
      return <LinkBadge type={enhancedLink.badge} text={badgeLabels[enhancedLink.badge]} />;
    }

    // Check if link was recently updated (within 7 days)
    if (enhancedLink.lastUpdated) {
      const daysSinceUpdate = Math.floor((Date.now() - enhancedLink.lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceUpdate <= 7) {
        return <LinkBadge type="updated" text="Updated" />;
      }
    }

    // Check if link is popular (high click count)
    if (enhancedLink.clickCount && enhancedLink.clickCount > 10) {
      return <LinkBadge type="popular" text="Popular" />;
    }

    return null;
  };

  return <>{renderLinkBadge(enhancedLink)}</>;
};