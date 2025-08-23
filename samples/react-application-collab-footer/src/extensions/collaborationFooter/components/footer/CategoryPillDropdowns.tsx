import * as React from 'react';
import { useMemo, memo } from 'react';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { Stack } from '@fluentui/react/lib/Stack';
import { PillDropdown } from './PillDropdown';
import styles from './CategoryPillDropdowns.module.scss';

export interface ICategoryPillDropdownsProps {
  organizationLinks: IContextualMenuItem[];
  personalLinks: IContextualMenuItem[];
  onLinkClick?: (link: IContextualMenuItem) => void;
  displayMode?: 'category' | 'mixed' | 'type';
  showBadges?: boolean;
  maxPillsPerRow?: number;
  className?: string;
  pillStyle?: 'rounded' | 'square' | 'minimal';
  density?: 'compact' | 'normal' | 'spacious';
}

type IGroupedLinks = Map<string, IContextualMenuItem[]>;

const CategoryPillDropdownsComponent: React.FC<ICategoryPillDropdownsProps> = ({
  organizationLinks,
  personalLinks,
  onLinkClick,
  displayMode = 'category',
  showBadges = true,
  maxPillsPerRow = 6,
  className = '',
  pillStyle = 'rounded',
  density = 'normal'
}) => {
  
  
  // Group organization links by category using Map for better performance
  const groupedOrgLinks = useMemo((): IGroupedLinks => {
    const grouped = new Map<string, IContextualMenuItem[]>();
    
    
    organizationLinks.forEach(link => {
      const category = (link.data as any)?.category || 'General';
      const existing = grouped.get(category);
      if (existing) {
        existing.push(link);
      } else {
        grouped.set(category, [link]);
      }
    });
    
    
    return grouped;
  }, [organizationLinks]);

  // Group personal links by category using Map for better performance
  const groupedPersonalLinks = useMemo((): IGroupedLinks => {
    const grouped = new Map<string, IContextualMenuItem[]>();
    
    personalLinks.forEach(link => {
      const category = (link.data as any)?.category || 'General';
      const existing = grouped.get(category);
      if (existing) {
        existing.push(link);
      } else {
        grouped.set(category, [link]);
      }
    });
    
    return grouped;
  }, [personalLinks]);

  // Get category icon based on category name
  const getCategoryIcon = (category: string): string => {
    const categoryLower = category.toLowerCase();
    
    if (categoryLower.includes('m365') || categoryLower.includes('microsoft') || categoryLower.includes('office')) {
      return 'OfficeLogo';
    }
    if (categoryLower.includes('hr') || categoryLower.includes('human')) {
      return 'People';
    }
    if (categoryLower.includes('it') || categoryLower.includes('tech')) {
      return 'Settings';
    }
    if (categoryLower.includes('finance') || categoryLower.includes('accounting')) {
      return 'Money';
    }
    if (categoryLower.includes('business') || categoryLower.includes('tools')) {
      return 'WorkItem';
    }
    if (categoryLower.includes('development') || categoryLower.includes('learning')) {
      return 'Education';
    }
    if (categoryLower.includes('communication') || categoryLower.includes('social')) {
      return 'Chat';
    }
    if (categoryLower.includes('project') || categoryLower.includes('management')) {
      return 'ProjectManagement';
    }
    if (categoryLower.includes('security') || categoryLower.includes('compliance')) {
      return 'Shield';
    }
    if (categoryLower.includes('personal')) {
      return 'Contact';
    }
    
    return 'Tag';
  };

  // Render category-based pills (e.g., M365, HR, IT, etc.)
  const renderCategoryPills = () => {
    // Force re-computation by creating fresh sets and arrays
    const orgCategories = Array.from(groupedOrgLinks.keys());
    const personalCategories = Array.from(groupedPersonalLinks.keys());
    const allCategories = new Set([...orgCategories, ...personalCategories]);


    const categoryPills = Array.from(allCategories)
      .sort()
      .map(category => {
        const orgLinksInCategory = groupedOrgLinks.get(category) || [];
        const personalLinksInCategory = groupedPersonalLinks.get(category) || [];
        const allLinksInCategory = [...orgLinksInCategory, ...personalLinksInCategory];
        
        if (allLinksInCategory.length === 0) return null;

        return (
          <PillDropdown
            key={`category-${category}-${allLinksInCategory.length}`}
            title={category}
            iconName={getCategoryIcon(category)}
            items={allLinksInCategory}
            variant="category"
            onItemClick={onLinkClick}
            badge={undefined}
            groupByCategory={false}
            showIcons={true}
            isNested={false}
            pillStyle={pillStyle}
            density={density}
          />
        );
      })
      .filter(Boolean);

    return categoryPills;
  };

  // Render organization and personal pills separately
  const renderTypePills = () => {
    const pills = [];

    // Organization Links Pill (now nested)
    if (organizationLinks.length > 0) {
      pills.push(
        <PillDropdown
          key="organization"
          title="Org Links"
          iconName="Globe"
          items={organizationLinks}
          variant="organization"
          onItemClick={onLinkClick}
          badge={undefined}
          groupByCategory={true}
          showIcons={true}
          isNested={true}
          pillStyle={pillStyle}
          density={density}
        />
      );
    }

    // Personal Links Pill (now nested)
    if (personalLinks.length > 0) {
      pills.push(
        <PillDropdown
          key="personal"
          title="Personal Links"
          iconName="Contact"
          items={personalLinks}
          variant="personal"
          onItemClick={onLinkClick}
          badge={undefined}
          groupByCategory={true}
          showIcons={true}
          isNested={true}
          pillStyle={pillStyle}
          density={density}
        />
      );
    }

    return pills;
  };

  // Render mixed mode - both type and category pills
  const renderMixedPills = () => {
    const pills = [];

    // Add type pills first
    pills.push(...renderTypePills());

    // Add category pills for categories with significant items
    const significantCategories = Array.from(groupedOrgLinks.entries())
      .filter(([_, items]) => items.length >= 3) // Only show categories with 3+ items
      .map(([category, items]) => (
        <PillDropdown
          key={`cat-${category}`}
          title={category}
          iconName={getCategoryIcon(category)}
          items={items}
          variant="category"
          onItemClick={onLinkClick}
          badge={undefined}
          groupByCategory={false}
          showIcons={true}
          isNested={false}
          pillStyle={pillStyle}
          density={density}
        />
      ));

    pills.push(...significantCategories);

    return pills;
  };

  const renderPills = () => {
    switch (displayMode) {
      case 'category':
        return renderCategoryPills();
      case 'type':
        return renderTypePills();
      case 'mixed':
        return renderMixedPills();
      default:
        return renderCategoryPills();
    }
  };

  const pills = renderPills();

  if (pills.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.categoryPillDropdowns} ${className}`}>
      <Stack
        horizontal
        wrap
        tokens={{ childrenGap: 12 }}
        className={styles.pillsContainer}
        styles={{
          root: {
            justifyContent: 'flex-start',
            maxWidth: '100%'
          }
        }}
      >
        {pills}
      </Stack>
    </div>
  );
};

// Memoized export for performance optimization  
export const CategoryPillDropdowns = memo(CategoryPillDropdownsComponent, (prevProps, nextProps) => {
  // Fast shallow checks for performance-critical props
  if (prevProps.organizationLinks.length !== nextProps.organizationLinks.length) return false;
  if (prevProps.personalLinks.length !== nextProps.personalLinks.length) return false;
  if (prevProps.displayMode !== nextProps.displayMode) return false;
  if (prevProps.showBadges !== nextProps.showBadges) return false;
  if (prevProps.pillStyle !== nextProps.pillStyle) return false;
  if (prevProps.density !== nextProps.density) return false;
  if (prevProps.maxPillsPerRow !== nextProps.maxPillsPerRow) return false;
  if (prevProps.className !== nextProps.className) return false;
  
  // Deep compare links including category data to detect category changes
  const orgLinksChanged = !prevProps.organizationLinks.every((link, index) => {
    const nextLink = nextProps.organizationLinks[index];
    return nextLink &&
      link.key === nextLink.key &&
      link.name === nextLink.name &&
      (link.data as any)?.category === (nextLink.data as any)?.category;
  });
  if (orgLinksChanged) return false;
  
  const personalLinksChanged = !prevProps.personalLinks.every((link, index) => {
    const nextLink = nextProps.personalLinks[index];
    return nextLink &&
      link.key === nextLink.key &&
      link.name === nextLink.name &&
      (link.data as any)?.category === (nextLink.data as any)?.category;
  });
  if (personalLinksChanged) return false;
  
  return true;
});

// Individual specialized components
export interface IOrganizationPillProps {
  links: IContextualMenuItem[];
  onLinkClick?: (link: IContextualMenuItem) => void;
  showBadge?: boolean;
}

export const OrganizationPill: React.FC<IOrganizationPillProps> = ({
  links,
  onLinkClick,
  showBadge = true
}) => {
  if (links.length === 0) return null;

  return (
    <PillDropdown
      title="Org Links"
      iconName="Globe"
      items={links}
      variant="organization"
      onItemClick={onLinkClick}
      badge={showBadge ? links.length : undefined}
      groupByCategory={true}
      showIcons={true}
      isNested={true}
    />
  );
};

export interface IPersonalPillProps {
  links: IContextualMenuItem[];
  onLinkClick?: (link: IContextualMenuItem) => void;
  showBadge?: boolean;
}

export const PersonalPill: React.FC<IPersonalPillProps> = ({
  links,
  onLinkClick,
  showBadge = true
}) => {
  if (links.length === 0) return null;

  return (
    <PillDropdown
      title="Personal Links"
      iconName="Contact"
      items={links}
      variant="personal"
      onItemClick={onLinkClick}
      badge={showBadge ? links.length : undefined}
      groupByCategory={true}
      showIcons={true}
      isNested={true}
    />
  );
};

export interface ICategoryPillProps {
  category: string;
  links: IContextualMenuItem[];
  onLinkClick?: (link: IContextualMenuItem) => void;
  showBadge?: boolean;
}

export const CategoryPill: React.FC<ICategoryPillProps> = ({
  category,
  links,
  onLinkClick,
  showBadge = true
}) => {
  if (links.length === 0) return null;

  const getCategoryIcon = (category: string): string => {
    const categoryLower = category.toLowerCase();
    
    if (categoryLower.includes('m365') || categoryLower.includes('microsoft')) {
      return 'OfficeLogo';
    }
    if (categoryLower.includes('hr')) {
      return 'People';
    }
    if (categoryLower.includes('it')) {
      return 'Settings';
    }
    if (categoryLower.includes('finance')) {
      return 'Money';
    }
    if (categoryLower.includes('business')) {
      return 'WorkItem';
    }
    
    return 'Tag';
  };

  return (
    <PillDropdown
      title={category}
      iconName={getCategoryIcon(category)}
      items={links}
      variant="category"
      onItemClick={onLinkClick}
      badge={showBadge ? links.length : undefined}
      groupByCategory={false}
      showIcons={true}
      isNested={false}
    />
  );
};