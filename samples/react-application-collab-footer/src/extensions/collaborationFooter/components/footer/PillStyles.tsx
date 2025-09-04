import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { Icon } from '@fluentui/react/lib/Icon';
import { Text } from '@fluentui/react/lib/Text';
import { AnimatedContainer, HoverAnimation } from '../shared/AnimatedComponents';
import styles from './PillStyles.module.scss';

export interface IPillStylesProps {
  title: string;
  iconName?: string;
  items: IContextualMenuItem[];
  style?: 'modern' | 'classic' | 'minimal' | 'gradient' | 'glass' | 'neon' | 'rounded' | 'sharp';
  size?: 'small' | 'medium' | 'large';
  variant?: 'category' | 'organization' | 'personal';
  onItemClick?: (item: IContextualMenuItem) => void;
  badge?: number;
  className?: string;
  groupByCategory?: boolean;
  showIcons?: boolean;
}

export const PillStyles: React.FC<IPillStylesProps> = ({
  title,
  iconName,
  items,
  style = 'modern',
  size = 'medium',
  variant = 'category',
  onItemClick,
  badge,
  className = '',
  groupByCategory = false,
  showIcons = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ bottom: number; left: number; right?: number }>({ bottom: 0, left: 0 });
  const pillRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate dropdown position
  const updatePosition = useCallback(() => {
    if (!pillRef.current) return;

    const rect = pillRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const dropdownWidth = 300;

    let left = rect.left;
    let right: number | undefined = undefined;

    if (left + dropdownWidth > viewportWidth - 20) {
      right = viewportWidth - rect.right;
      left = rect.right - dropdownWidth;
    }

    setPosition({
      bottom: window.innerHeight - rect.top + 8,
      left: Math.max(20, left),
      right
    });
  }, []);

  const handlePillClick = useCallback(() => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  }, [isOpen, updatePosition]);

  const handleItemClick = useCallback((item: IContextualMenuItem, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (onItemClick) {
      onItemClick(item);
    } else if (item.href) {
      window.open(item.href, item.target || '_blank', 'noopener,noreferrer');
    }
    
    setIsOpen(false);
  }, [onItemClick]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        pillRef.current &&
        dropdownRef.current &&
        !pillRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getPillIcon = () => {
    if (iconName) return iconName;
    
    switch (variant) {
      case 'organization':
        return 'Globe';
      case 'personal':
        return 'Contact';
      default:
        return 'Tag';
    }
  };

  const getPillClasses = () => {
    return `${styles.pill} ${styles[style]} ${styles[size]} ${styles[variant]} ${isOpen ? styles.open : ''} ${className}`;
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      {/* Pill Button */}
      <HoverAnimation hoverType="lift">
        <button
          ref={pillRef}
          className={getPillClasses()}
          onClick={handlePillClick}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={`${title} - ${items.length} items`}
        >
          <div className={styles.pillContent}>
            {/* Icon */}
            <div className={styles.iconContainer}>
              <Icon iconName={getPillIcon()} className={styles.pillIcon} />
            </div>
            
            {/* Text */}
            <Text variant="medium" className={styles.pillText}>
              {title}
            </Text>
            
            {/* Badge */}
            {badge && badge > 0 && (
              <div className={styles.badge}>
                {badge > 99 ? '99+' : badge}
              </div>
            )}
            
            {/* Chevron */}
            <Icon 
              iconName={isOpen ? 'ChevronDown' : 'ChevronUp'} 
              className={styles.chevron}
            />
            
            {/* Style-specific decorations */}
            {style === 'gradient' && <div className={styles.gradientOverlay} />}
            {style === 'neon' && <div className={styles.neonGlow} />}
          </div>
        </button>
      </HoverAnimation>

      {/* Dropdown */}
      {isOpen && (
        <div className={styles.dropdownPortal}>
          <AnimatedContainer
            isVisible={isOpen}
            animationType="slide"
            className={styles.dropdownContainer}
            style={{
              position: 'fixed',
              bottom: position.bottom,
              left: position.left,
              right: position.right,
              zIndex: 9999
            }}
          >
            <div
              ref={dropdownRef}
              className={`${styles.dropdown} ${styles[`dropdown_${style}`]}`}
            >
              {/* Header */}
              <div className={styles.dropdownHeader}>
                <div className={styles.headerContent}>
                  <Icon iconName={getPillIcon()} className={styles.headerIcon} />
                  <Text variant="mediumPlus" className={styles.headerTitle}>
                    {title}
                  </Text>
                </div>
                <div className={styles.itemCount}>
                  {items.length}
                </div>
              </div>

              {/* Content */}
              <div className={styles.dropdownContent}>
                {groupByCategory ? renderGroupedItems() : renderFlatItems()}
              </div>
            </div>
          </AnimatedContainer>
        </div>
      )}
    </>
  );

  function renderFlatItems() {
    return (
      <div className={styles.itemsList}>
        {items.map((item, index) => (
          <AnimatedContainer
            key={item.key || index}
            isVisible={isOpen}
            animationType="slide"
            delay={index * 30}
          >
            <HoverAnimation hoverType="lift">
              <button
                className={`${styles.dropdownItem} ${styles[`item_${style}`]}`}
                onClick={(e) => handleItemClick(item, e)}
                title={item.title || item.name}
              >
                {showIcons && (
                  <div className={styles.itemIcon}>
                    {(item.data as any)?.iconUrl ? (
                      <img 
                        src={(item.data as any).iconUrl} 
                        alt="" 
                        className={styles.customIcon}
                      />
                    ) : (
                      <Icon 
                        iconName={item.iconProps?.iconName || 'Link'} 
                        className={styles.icon}
                      />
                    )}
                  </div>
                )}
                <div className={styles.itemContent}>
                  <Text variant="medium" className={styles.itemTitle}>
                    {item.name}
                  </Text>
                  {item.title && item.title !== item.name && (
                    <Text variant="small" className={styles.itemDescription}>
                      {item.title}
                    </Text>
                  )}
                </div>
                {(item.data as any)?.isMandatory && (
                  <div className={styles.mandatoryIndicator}>
                    <Icon iconName="Important" />
                  </div>
                )}
              </button>
            </HoverAnimation>
          </AnimatedContainer>
        ))}
      </div>
    );
  }

  function renderGroupedItems() {
    const grouped: { [category: string]: IContextualMenuItem[] } = {};
    
    items.forEach(item => {
      const category = (item.data as any)?.category || 'General';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });

    return (
      <div className={styles.categoriesList}>
        {Object.entries(grouped).map(([category, categoryItems], categoryIndex) => (
          <AnimatedContainer
            key={category}
            isVisible={isOpen}
            animationType="slide"
            delay={categoryIndex * 50}
            className={styles.categoryGroup}
          >
            <div className={styles.categoryHeader}>
              <Text variant="smallPlus" className={styles.categoryTitle}>
                {category}
              </Text>
              <div className={styles.categoryCount}>
                {categoryItems.length}
              </div>
            </div>
            <div className={styles.categoryItems}>
              {categoryItems.map((item, itemIndex) => (
                <HoverAnimation key={item.key || itemIndex} hoverType="lift">
                  <button
                    className={`${styles.categoryItem} ${styles[`item_${style}`]}`}
                    onClick={(e) => handleItemClick(item, e)}
                    title={item.title || item.name}
                  >
                    {showIcons && (
                      <div className={styles.itemIcon}>
                        {(item.data as any)?.iconUrl ? (
                          <img 
                            src={(item.data as any).iconUrl} 
                            alt="" 
                            className={styles.customIcon}
                          />
                        ) : (
                          <Icon 
                            iconName={item.iconProps?.iconName || 'Link'} 
                            className={styles.icon}
                          />
                        )}
                      </div>
                    )}
                    <Text variant="small" className={styles.itemTitle}>
                      {item.name}
                    </Text>
                    {(item.data as any)?.isMandatory && (
                      <div className={styles.mandatoryIndicator}>
                        <Icon iconName="Important" />
                      </div>
                    )}
                  </button>
                </HoverAnimation>
              ))}
            </div>
          </AnimatedContainer>
        ))}
      </div>
    );
  }
};