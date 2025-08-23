import { useState, useCallback, useMemo } from 'react';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';

export interface IBulkEditData {
  [key: string]: unknown;
}

export interface IBulkSelectionHook {
  // State
  selectedItems: Set<string>;
  bulkSelectionMode: boolean;
  
  // Actions
  toggleItemSelection: (itemKey: string) => void;
  selectAllItems: (items: IContextualMenuItem[]) => void;
  deselectAllItems: () => void;
  toggleBulkSelectionMode: () => void;
  isItemSelected: (itemKey: string) => boolean;
  
  // Bulk Operations
  deleteSelectedItems: (items: IContextualMenuItem[], onDelete: (keys: string[]) => void) => void;
  editSelectedItems: (items: IContextualMenuItem[], onEdit: (keys: string[], newData: IBulkEditData) => void, newData: IBulkEditData) => void;
  exportSelectedItems: (items: IContextualMenuItem[], onExport: (selectedItems: IContextualMenuItem[]) => void) => void;
  
  // Computed values
  selectedCount: number;
  isAllSelected: (items: IContextualMenuItem[]) => boolean;
  isSomeSelected: (items: IContextualMenuItem[]) => boolean;
  canPerformBulkActions: boolean;
}

export const useBulkSelection = (): IBulkSelectionHook => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkSelectionMode, setBulkSelectionMode] = useState<boolean>(false);

  const toggleItemSelection = useCallback((itemKey: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
      }
      return newSet;
    });
  }, []);

  const selectAllItems = useCallback((items: IContextualMenuItem[]) => {
    const allKeys = items.map(item => item.key);
    setSelectedItems(new Set(allKeys));
  }, []);

  const deselectAllItems = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const toggleBulkSelectionMode = useCallback(() => {
    setBulkSelectionMode(prev => {
      if (prev) {
        // Exiting bulk mode - clear selections
        setSelectedItems(new Set());
      }
      return !prev;
    });
  }, []);

  const isItemSelected = useCallback((itemKey: string): boolean => {
    return selectedItems.has(itemKey);
  }, [selectedItems]);

  const deleteSelectedItems = useCallback((
    items: IContextualMenuItem[], 
    onDelete: (keys: string[]) => void
  ) => {
    const selectedKeys = Array.from(selectedItems);
    const selectedItemsToDelete = items.filter(item => selectedItems.has(item.key));
    
    if (selectedItemsToDelete.length === 0) return;
    
    // Confirm deletion
    const confirmMessage = `Are you sure you want to delete ${selectedItemsToDelete.length} selected items?`;
    if (window.confirm(confirmMessage)) {
      onDelete(selectedKeys);
      setSelectedItems(new Set());
    }
  }, [selectedItems]);

  const editSelectedItems = useCallback((
    items: IContextualMenuItem[], 
    onEdit: (keys: string[], newData: IBulkEditData) => void, 
    newData: IBulkEditData
  ) => {
    const selectedKeys = Array.from(selectedItems);
    if (selectedKeys.length === 0) return;
    
    onEdit(selectedKeys, newData);
    setSelectedItems(new Set());
  }, [selectedItems]);

  const exportSelectedItems = useCallback((
    items: IContextualMenuItem[], 
    onExport: (selectedItems: IContextualMenuItem[]) => void
  ) => {
    const selectedItemsToExport = items.filter(item => selectedItems.has(item.key));
    if (selectedItemsToExport.length === 0) return;
    
    onExport(selectedItemsToExport);
  }, [selectedItems]);

  const selectedCount = useMemo(() => selectedItems.size, [selectedItems]);

  const isAllSelected = useCallback((items: IContextualMenuItem[]): boolean => {
    if (items.length === 0) return false;
    return items.every(item => selectedItems.has(item.key));
  }, [selectedItems]);

  const isSomeSelected = useCallback((items: IContextualMenuItem[]): boolean => {
    return items.some(item => selectedItems.has(item.key));
  }, [selectedItems]);

  const canPerformBulkActions = useMemo(() => selectedItems.size > 0, [selectedItems]);

  return {
    // State
    selectedItems,
    bulkSelectionMode,
    
    // Actions
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    toggleBulkSelectionMode,
    isItemSelected,
    
    // Bulk Operations
    deleteSelectedItems,
    editSelectedItems,
    exportSelectedItems,
    
    // Computed values
    selectedCount,
    isAllSelected,
    isSomeSelected,
    canPerformBulkActions
  };
};