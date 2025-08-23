import { useState, useMemo, useCallback } from 'react';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';

export interface IFilterAndSearchState {
  searchQuery: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  selectedCategory: string;
  currentPage: number;
  itemsPerPage: number;
}

export interface IFilterAndSearchHook {
  // State
  state: IFilterAndSearchState;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: string) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  setSelectedCategory: (category: string) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  resetFilters: () => void;
  
  // Computed values
  filteredAndSortedItems: IContextualMenuItem[];
  paginatedItems: IContextualMenuItem[];
  totalPages: number;
  availableCategories: { key: string; text: string }[];
  itemCount: { showing: number; total: number };
}

const DEFAULT_STATE: IFilterAndSearchState = {
  searchQuery: '',
  sortBy: 'name',
  sortDirection: 'asc',
  selectedCategory: 'all',
  currentPage: 1,
  itemsPerPage: 10
};

export const useFilterAndSearch = (
  items: IContextualMenuItem[],
  initialState: Partial<IFilterAndSearchState> = {}
): IFilterAndSearchHook => {
  
  const [state, setState] = useState<IFilterAndSearchState>({
    ...DEFAULT_STATE,
    ...initialState
  });

  const setSearchQuery = useCallback((searchQuery: string) => {
    setState(prev => ({ ...prev, searchQuery, currentPage: 1 }));
  }, []);

  const setSortBy = useCallback((sortBy: string) => {
    setState(prev => ({ ...prev, sortBy }));
  }, []);

  const setSortDirection = useCallback((sortDirection: 'asc' | 'desc') => {
    setState(prev => ({ ...prev, sortDirection }));
  }, []);

  const setSelectedCategory = useCallback((selectedCategory: string) => {
    setState(prev => ({ ...prev, selectedCategory, currentPage: 1 }));
  }, []);

  const setCurrentPage = useCallback((currentPage: number) => {
    setState(prev => ({ ...prev, currentPage }));
  }, []);

  const setItemsPerPage = useCallback((itemsPerPage: number) => {
    setState(prev => ({ ...prev, itemsPerPage, currentPage: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  // Get available categories from items
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    items.forEach(item => {
      const category = (item.data as any)?.category || 'General';
      categories.add(category.toLowerCase());
    });
    
    return [
      { key: 'all', text: 'All Categories' },
      ...Array.from(categories).sort().map(category => ({
        key: category,
        text: category.charAt(0).toUpperCase() + category.slice(1)
      }))
    ];
  }, [items]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...items];

    // Apply category filter
    if (state.selectedCategory !== 'all') {
      filtered = filtered.filter(item => {
        const itemCategory = ((item.data as any)?.category || 'general').toLowerCase();
        return itemCategory === state.selectedCategory;
      });
    }

    // Apply search filter
    if (state.searchQuery.trim()) {
      const searchLower = state.searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const name = item.name?.toLowerCase() || '';
        const url = item.href?.toLowerCase() || '';
        const description = ((item.data as any)?.description || item.title || '').toLowerCase();
        const category = ((item.data as any)?.category || '').toLowerCase();
        
        return name.includes(searchLower) || 
               url.includes(searchLower) || 
               description.includes(searchLower) || 
               category.includes(searchLower);
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string;
      let bValue: string;
      
      switch (state.sortBy) {
        case 'url':
          aValue = a.href || '';
          bValue = b.href || '';
          break;
        case 'category':
          aValue = (a.data as any)?.category || 'General';
          bValue = (b.data as any)?.category || 'General';
          break;
        case 'name':
        default:
          aValue = a.name || '';
          bValue = b.name || '';
          break;
      }
      
      const comparison = aValue.localeCompare(bValue);
      return state.sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [items, state.searchQuery, state.sortBy, state.sortDirection, state.selectedCategory]);

  // Apply pagination
  const paginatedItems = useMemo(() => {
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    return filteredAndSortedItems.slice(startIndex, endIndex);
  }, [filteredAndSortedItems, state.currentPage, state.itemsPerPage]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSortedItems.length / state.itemsPerPage);
  }, [filteredAndSortedItems.length, state.itemsPerPage]);

  // Calculate item count
  const itemCount = useMemo(() => ({
    showing: paginatedItems.length,
    total: filteredAndSortedItems.length
  }), [paginatedItems.length, filteredAndSortedItems.length]);

  return {
    // State
    state,
    
    // Actions
    setSearchQuery,
    setSortBy,
    setSortDirection,
    setSelectedCategory,
    setCurrentPage,
    setItemsPerPage,
    resetFilters,
    
    // Computed values
    filteredAndSortedItems,
    paginatedItems,
    totalPages,
    availableCategories,
    itemCount
  };
};