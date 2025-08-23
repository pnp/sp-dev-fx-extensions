import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { CategoryService, ILinkCategory, ICategoryStats } from '../services/categoryService';
import { Log } from '@microsoft/sp-core-library';

const LOG_SOURCE: string = 'useCategories';

export interface ICategoriesHook {
  // State
  categories: ILinkCategory[];
  activeCategories: ILinkCategory[];
  categoryOptions: Array<{key: string, text: string}>;
  categoryStats: ICategoryStats | null;
  isLoading: boolean;
  
  // Methods
  refreshCategories: () => Promise<void>;
  createCategory: (categoryData: Partial<ILinkCategory>) => Promise<ILinkCategory>;
  updateCategory: (categoryId: string, updates: Partial<ILinkCategory>) => Promise<ILinkCategory>;
  deleteCategory: (categoryId: string) => Promise<void>;
  reorderCategories: (categoryIds: string[]) => Promise<ILinkCategory[]>;
  exportCategories: () => Promise<string>;
  importCategories: (categoriesJson: string, replaceExisting?: boolean) => Promise<ILinkCategory[]>;
  resetToDefaults: () => Promise<ILinkCategory[]>;
  
  // Helpers
  getCategoryById: (id: string) => ILinkCategory | undefined;
  getCategoryByName: (name: string) => ILinkCategory | undefined;
  getLinksForCategory: (categoryId: string) => IContextualMenuItem[];
  validateCategory: (category: Partial<ILinkCategory>) => string[];
}

export const useCategories = (
  context?: WebPartContext,
  links: IContextualMenuItem[] = []
): ICategoriesHook => {
  const [categories, setCategories] = useState<ILinkCategory[]>([]);
  const [categoryStats, setCategoryStats] = useState<ICategoryStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Store links in a ref to avoid recreating the callback when links change
  const linksRef = useRef(links);
  
  // Update the ref when links change
  useEffect(() => {
    linksRef.current = links;
  }, [links]);

  // Refresh categories from storage
  const refreshCategories = useCallback(async () => {
    if (!context) return;
    
    try {
      setIsLoading(true);
      
      const [categoriesData, statsData] = await Promise.all([
        CategoryService.getCategories(context),
        CategoryService.getCategoryStats(linksRef.current, context)
      ]);
      
      setCategories(categoriesData);
      setCategoryStats(statsData);
      
      Log.info(LOG_SOURCE, `Loaded ${categoriesData.length} categories`);
      
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      setCategories([]);
      setCategoryStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [context]); // ✅ FIXED: Only depend on context, not links

  // Create new category
  const createCategory = useCallback(async (categoryData: Partial<ILinkCategory>): Promise<ILinkCategory> => {
    if (!context) throw new Error('Context is required');
    
    try {
      const newCategory = await CategoryService.createCategory(categoryData, context);
      await refreshCategories();
      return newCategory;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }, [context, refreshCategories]);

  // Update existing category
  const updateCategory = useCallback(async (
    categoryId: string, 
    updates: Partial<ILinkCategory>
  ): Promise<ILinkCategory> => {
    if (!context) throw new Error('Context is required');
    
    try {
      const updatedCategory = await CategoryService.updateCategory(categoryId, updates, context);
      await refreshCategories();
      return updatedCategory;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }, [context, refreshCategories]);

  // Delete category
  const deleteCategory = useCallback(async (categoryId: string): Promise<void> => {
    if (!context) throw new Error('Context is required');
    
    try {
      await CategoryService.deleteCategory(categoryId, context, links);
      await refreshCategories();
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }, [context, links, refreshCategories]);

  // Reorder categories
  const reorderCategories = useCallback(async (categoryIds: string[]): Promise<ILinkCategory[]> => {
    if (!context) throw new Error('Context is required');
    
    try {
      const reorderedCategories = await CategoryService.reorderCategories(categoryIds, context);
      await refreshCategories();
      return reorderedCategories;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }, [context, refreshCategories]);

  // Export categories
  const exportCategories = useCallback(async (): Promise<string> => {
    if (!context) throw new Error('Context is required');
    
    try {
      return await CategoryService.exportCategories(context);
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }, [context]);

  // Import categories
  const importCategories = useCallback(async (
    categoriesJson: string, 
    replaceExisting = false
  ): Promise<ILinkCategory[]> => {
    if (!context) throw new Error('Context is required');
    
    try {
      const importedCategories = await CategoryService.importCategories(categoriesJson, context, replaceExisting);
      await refreshCategories();
      return importedCategories;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }, [context, refreshCategories]);

  // Reset to defaults
  const resetToDefaults = useCallback(async (): Promise<ILinkCategory[]> => {
    if (!context) throw new Error('Context is required');
    
    try {
      const defaultCategories = await CategoryService.resetToDefaults(context);
      await refreshCategories();
      return defaultCategories;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }, [context, refreshCategories]);

  // Validate category data
  const validateCategory = useCallback((category: Partial<ILinkCategory>): string[] => {
    return CategoryService.validateCategory(category);
  }, []);

  // Get category by ID
  const getCategoryById = useCallback((id: string): ILinkCategory | undefined => {
    return categories.find(cat => cat.id === id);
  }, [categories]);

  // Get category by name
  const getCategoryByName = useCallback((name: string): ILinkCategory | undefined => {
    return categories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
  }, [categories]);

  // Get links for specific category
  const getLinksForCategory = useCallback((categoryId: string): IContextualMenuItem[] => {
    return links.filter(link => {
      const linkData = link as any;
      return linkData.category === categoryId || linkData.category === getCategoryById(categoryId)?.name;
    });
  }, [links, getCategoryById]);

  // Load categories on mount and when context changes
  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  // Refresh categories when links change (debounced to avoid excessive calls)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refreshCategories();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [links.length, refreshCategories]); // ✅ Only depend on links.length to avoid object reference issues

  // Memoized computed values
  const activeCategories = useMemo(() => 
    categories.filter(cat => cat.isActive), 
    [categories]
  );

  const categoryOptions = useMemo(() => 
    activeCategories.map(cat => ({
      key: cat.id,
      text: cat.name
    })), 
    [activeCategories]
  );

  // Memoized return value
  const hookValue = useMemo((): ICategoriesHook => ({
    // State
    categories,
    activeCategories,
    categoryOptions,
    categoryStats,
    isLoading,
    
    // Methods
    refreshCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    exportCategories,
    importCategories,
    resetToDefaults,
    
    // Helpers
    getCategoryById,
    getCategoryByName,
    getLinksForCategory,
    validateCategory
  }), [
    categories,
    activeCategories,
    categoryOptions,
    categoryStats,
    isLoading,
    refreshCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    exportCategories,
    importCategories,
    resetToDefaults,
    getCategoryById,
    getCategoryByName,
    getLinksForCategory,
    validateCategory
  ]);

  return hookValue;
};