import * as React from 'react';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { Stack } from '@fluentui/react/lib/Stack';

export interface ISearchAndFilterControlsProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  
  // Category filter
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  categoryOptions?: IDropdownOption[];
  categoryPlaceholder?: string;
  
  // Sort options
  sortBy?: string;
  onSortChange?: (sortBy: string) => void;
  sortOptions?: IDropdownOption[];
  
  // Sort direction
  sortDirection?: 'asc' | 'desc';
  onSortDirectionChange?: (direction: 'asc' | 'desc') => void;
  
  // Additional filters
  additionalFilters?: React.ReactNode;
  
  // Layout
  vertical?: boolean;
  gap?: number;
}

export const SearchAndFilterControls: React.FC<ISearchAndFilterControlsProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  
  selectedCategory,
  onCategoryChange,
  categoryOptions,
  categoryPlaceholder = "Filter by category",
  
  sortBy,
  onSortChange,
  sortOptions,
  
  sortDirection,
  onSortDirectionChange,
  
  additionalFilters,
  vertical = false,
  gap = 16
}) => {
  const commonDropdownStyles = {
    root: { minWidth: '200px', height: '36px' },
    dropdown: { 
      borderRadius: '4px', 
      height: '36px', 
      minHeight: '36px', 
      border: '1px solid #d1d1d1',
      backgroundColor: '#ffffff'
    }
  };

  const searchBoxStyles = {
    root: { 
      minWidth: '300px', 
      height: '36px', 
      display: 'flex', 
      alignItems: 'center' 
    },
    field: { 
      height: '36px', 
      minHeight: '36px', 
      display: 'flex', 
      alignItems: 'center', 
      backgroundColor: '#ffffff',
      border: '1px solid #d1d1d1',
      borderRadius: '4px',
      '&:hover': {
        border: '1px solid #106ebe'
      },
      '&:focus-within': {
        border: '1px solid #0078d4'
      }
    }
  };

  const sortDirectionOptions: IDropdownOption[] = [
    { key: 'asc', text: 'Ascending' },
    { key: 'desc', text: 'Descending' }
  ];

  return (
    <div className="filterControls">
      <Stack 
        horizontal={!vertical} 
        tokens={{ childrenGap: gap }} 
        verticalAlign="center" 
        wrap
      >
        {/* Search Box */}
        <SearchBox
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(_, newValue) => onSearchChange(newValue || '')}
          styles={searchBoxStyles}
        />
        
        {/* Category Filter */}
        {categoryOptions && onCategoryChange && (
          <Dropdown
            placeholder={categoryPlaceholder}
            selectedKey={selectedCategory}
            onChange={(_, option) => onCategoryChange(option?.key as string || 'all')}
            options={categoryOptions}
            styles={commonDropdownStyles}
          />
        )}
        
        {/* Sort By */}
        {sortOptions && onSortChange && (
          <Dropdown
            placeholder="Sort by"
            selectedKey={sortBy}
            onChange={(_, option) => onSortChange(option?.key as string || 'name')}
            options={sortOptions}
            styles={commonDropdownStyles}
          />
        )}
        
        {/* Sort Direction */}
        {sortDirection && onSortDirectionChange && (
          <Dropdown
            placeholder="Order"
            selectedKey={sortDirection}
            onChange={(_, option) => onSortDirectionChange(option?.key as 'asc' | 'desc' || 'asc')}
            options={sortDirectionOptions}
            styles={commonDropdownStyles}
          />
        )}
        
        {/* Additional Filters */}
        {additionalFilters}
      </Stack>
    </div>
  );
};