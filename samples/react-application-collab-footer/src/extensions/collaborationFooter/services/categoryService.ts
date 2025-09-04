import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { Log } from '@microsoft/sp-core-library';

const LOG_SOURCE: string = 'CategoryService';

export interface ILinkCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string;
  linkCount?: number;
}

export interface ICategoryStats {
  totalCategories: number;
  activeCategories: number;
  categoriesWithLinks: number;
  mostPopularCategory: string;
  leastUsedCategories: string[];
}

export class CategoryService {
  private static readonly STORAGE_KEY = 'CollabFooter_Categories';
  private static _categoriesCache = new Map<string, { data: ILinkCategory[]; timestamp: number }>();
  private static readonly CACHE_DURATION = 300000; // 5 minutes
  
  private static readonly DEFAULT_CATEGORIES: ILinkCategory[] = [
    {
      id: 'general',
      name: 'General',
      description: 'General purpose links',
      icon: 'Globe',
      color: '#0078d4',
      sortOrder: 1,
      isActive: true,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString()
    },
    {
      id: 'microsoft-365',
      name: 'Microsoft 365',
      description: 'Microsoft 365 applications and services',
      icon: 'OfficeLogo',
      color: '#d83b01',
      sortOrder: 2,
      isActive: true,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString()
    },
    {
      id: 'communication',
      name: 'Communication',
      description: 'Communication and collaboration tools',
      icon: 'Chat',
      color: '#107c10',
      sortOrder: 3,
      isActive: true,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString()
    },
    {
      id: 'resources',
      name: 'Resources',
      description: 'Documentation and resources',
      icon: 'Library',
      color: '#5c2d91',
      sortOrder: 4,
      isActive: true,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString()
    }
  ];

  /**
   * Get all categories from local storage
   */
  public static async getCategories(context?: WebPartContext): Promise<ILinkCategory[]> {
    const cacheKey = context?.pageContext?.user?.email || 'default';
    const now = Date.now();
    
    // Check cache first
    const cached = this._categoriesCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      let categories: ILinkCategory[];
      
      if (stored) {
        categories = JSON.parse(stored);
        categories.sort((a, b) => a.sortOrder - b.sortOrder);
      } else {
        // Initialize with default categories if none exist
        await this.saveCategories(this.DEFAULT_CATEGORIES, context);
        categories = [...this.DEFAULT_CATEGORIES];
      }
      
      // Cache the result
      this._categoriesCache.set(cacheKey, { data: categories, timestamp: now });
      
      return categories;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      const defaultCategories = [...this.DEFAULT_CATEGORIES];
      
      // Cache defaults even on error
      this._categoriesCache.set(cacheKey, { data: defaultCategories, timestamp: now });
      
      return defaultCategories;
    }
  }

  /**
   * Invalidate categories cache (for future use)
   */
  public static clearCache(cacheKey?: string): void {
    if (cacheKey) {
      this._categoriesCache.delete(cacheKey);
    } else {
      this._categoriesCache.clear();
    }
  }

  /**
   * Get active categories only
   */
  public static async getActiveCategories(context?: WebPartContext): Promise<ILinkCategory[]> {
    const allCategories = await this.getCategories(context);
    return allCategories.filter(cat => cat.isActive);
  }

  /**
   * Get categories as dropdown options
   */
  public static async getCategoryOptions(context?: WebPartContext): Promise<Array<{key: string, text: string}>> {
    const activeCategories = await this.getActiveCategories(context);
    return activeCategories.map(cat => ({
      key: cat.id,
      text: cat.name
    }));
  }

  /**
   * Save categories to local storage
   */
  public static async saveCategories(categories: ILinkCategory[], context?: WebPartContext): Promise<void> {
    try {
      const sortedCategories = categories
        .map(cat => ({
          ...cat,
          modifiedDate: new Date().toISOString()
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sortedCategories));
      Log.info(LOG_SOURCE, `Saved ${sortedCategories.length} categories`);

    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw new Error(`Failed to save categories: ${(error as Error).message}`);
    }
  }

  /**
   * Create a new category
   */
  public static async createCategory(categoryData: Partial<ILinkCategory>, context?: WebPartContext): Promise<ILinkCategory> {
    try {
      const existingCategories = await this.getCategories(context);
      
      // Validate category name
      if (!categoryData.name?.trim()) {
        throw new Error('Category name is required');
      }
      
      // Check for duplicate names
      if (existingCategories.some(cat => cat.name.toLowerCase() === categoryData.name!.toLowerCase())) {
        throw new Error('A category with this name already exists');
      }

      // Generate new category
      const newCategory: ILinkCategory = {
        id: categoryData.id || this.generateCategoryId(categoryData.name!),
        name: categoryData.name!.trim(),
        description: categoryData.description?.trim() || '',
        icon: categoryData.icon || 'Tag',
        color: categoryData.color || this.getRandomColor(),
        sortOrder: categoryData.sortOrder || existingCategories.length + 1,
        isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString()
      };

      const updatedCategories = [...existingCategories, newCategory];
      await this.saveCategories(updatedCategories, context);

      Log.info(LOG_SOURCE, `Created new category: ${newCategory.name}`);
      return newCategory;

    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }

  /**
   * Update an existing category
   */
  public static async updateCategory(categoryId: string, updates: Partial<ILinkCategory>, context?: WebPartContext): Promise<ILinkCategory> {
    try {
      const existingCategories = await this.getCategories(context);
      const categoryIndex = existingCategories.findIndex(cat => cat.id === categoryId);
      
      if (categoryIndex === -1) {
        throw new Error('Category not found');
      }

      // Validate name if updating
      if (updates.name?.trim()) {
        const duplicateIndex = existingCategories.findIndex(
          cat => cat.name.toLowerCase() === updates.name!.toLowerCase() && cat.id !== categoryId
        );
        if (duplicateIndex !== -1) {
          throw new Error('A category with this name already exists');
        }
      }

      const updatedCategory: ILinkCategory = {
        ...existingCategories[categoryIndex],
        ...updates,
        id: categoryId, // Ensure ID doesn't change
        modifiedDate: new Date().toISOString()
      };

      existingCategories[categoryIndex] = updatedCategory;
      await this.saveCategories(existingCategories, context);

      Log.info(LOG_SOURCE, `Updated category: ${updatedCategory.name}`);
      return updatedCategory;

    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }

  /**
   * Delete a category
   */
  public static async deleteCategory(categoryId: string, context?: WebPartContext, links?: IContextualMenuItem[]): Promise<void> {
    try {
      const existingCategories = await this.getCategories(context);
      const categoryToDelete = existingCategories.find(cat => cat.id === categoryId);
      
      if (!categoryToDelete) {
        throw new Error('Category not found');
      }

      // Check if category is in use
      if (links) {
        const linksUsingCategory = links.filter(link => (link as any).category === categoryId || (link as any).category === categoryToDelete.name);
        if (linksUsingCategory.length > 0) {
          throw new Error(`Cannot delete category "${categoryToDelete.name}" because it is used by ${linksUsingCategory.length} link(s)`);
        }
      }

      // Prevent deletion of default categories
      const isDefaultCategory = this.DEFAULT_CATEGORIES.some(cat => cat.id === categoryId);
      if (isDefaultCategory) {
        throw new Error('Cannot delete default categories. You can deactivate them instead.');
      }

      const updatedCategories = existingCategories.filter(cat => cat.id !== categoryId);
      await this.saveCategories(updatedCategories, context);

      Log.info(LOG_SOURCE, `Deleted category: ${categoryToDelete.name}`);

    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }

  /**
   * Reorder categories
   */
  public static async reorderCategories(categoryIds: string[], context?: WebPartContext): Promise<ILinkCategory[]> {
    try {
      const existingCategories = await this.getCategories(context);
      
      const reorderedCategories = categoryIds.map((id, index) => {
        const category = existingCategories.find(cat => cat.id === id);
        if (!category) {
          throw new Error(`Category with ID ${id} not found`);
        }
        
        return {
          ...category,
          sortOrder: index + 1,
          modifiedDate: new Date().toISOString()
        };
      });

      // Add any categories not in the reorder list at the end
      const unmanagedCategories = existingCategories
        .filter(cat => !categoryIds.includes(cat.id))
        .map((cat, index) => ({
          ...cat,
          sortOrder: reorderedCategories.length + index + 1
        }));

      const allCategories = [...reorderedCategories, ...unmanagedCategories];
      await this.saveCategories(allCategories, context);

      Log.info(LOG_SOURCE, 'Categories reordered successfully');
      return allCategories;

    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }

  /**
   * Get category statistics
   */
  public static async getCategoryStats(links: IContextualMenuItem[], context?: WebPartContext): Promise<ICategoryStats> {
    try {
      const categories = await this.getCategories(context);
      const activeCategories = categories.filter(cat => cat.isActive);
      
      // Count links per category
      const categoryLinkCounts = new Map<string, number>();
      links.forEach(link => {
        const linkData = link as any;
        const categoryId = linkData.category || 'general';
        categoryLinkCounts.set(categoryId, (categoryLinkCounts.get(categoryId) || 0) + 1);
      });

      // Find most popular category
      let mostPopularCategory = 'general';
      let maxLinks = 0;
      categoryLinkCounts.forEach((count, categoryId) => {
        if (count > maxLinks) {
          maxLinks = count;
          mostPopularCategory = categoryId;
        }
      });

      // Find least used categories (categories with 0 or very few links)
      const leastUsedCategories = categories
        .filter(cat => (categoryLinkCounts.get(cat.id) || 0) <= 1)
        .map(cat => cat.name);

      const categoriesWithLinks = categories.filter(cat => (categoryLinkCounts.get(cat.id) || 0) > 0).length;

      return {
        totalCategories: categories.length,
        activeCategories: activeCategories.length,
        categoriesWithLinks,
        mostPopularCategory: categories.find(cat => cat.id === mostPopularCategory)?.name || 'Unknown',
        leastUsedCategories
      };

    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return {
        totalCategories: 0,
        activeCategories: 0,
        categoriesWithLinks: 0,
        mostPopularCategory: 'Unknown',
        leastUsedCategories: []
      };
    }
  }

  /**
   * Export categories to JSON
   */
  public static async exportCategories(context?: WebPartContext): Promise<string> {
    try {
      const categories = await this.getCategories(context);
      return JSON.stringify(categories, null, 2);
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw new Error(`Failed to export categories: ${(error as Error).message}`);
    }
  }

  /**
   * Import categories from JSON
   */
  public static async importCategories(categoriesJson: string, context?: WebPartContext, replaceExisting = false): Promise<ILinkCategory[]> {
    try {
      const importedCategories: ILinkCategory[] = JSON.parse(categoriesJson);
      
      // Validate imported data
      if (!Array.isArray(importedCategories)) {
        throw new Error('Invalid categories format');
      }

      const existingCategories = replaceExisting ? [] : await this.getCategories(context);
      const finalCategories = [...existingCategories];

      let importedCount = 0;
      let skippedCount = 0;

      for (const importedCategory of importedCategories) {
        // Validate required fields
        if (!importedCategory.name || !importedCategory.id) {
          skippedCount++;
          continue;
        }

        // Check for duplicates
        const existingIndex = finalCategories.findIndex(cat => 
          cat.id === importedCategory.id || cat.name.toLowerCase() === importedCategory.name.toLowerCase()
        );

        if (existingIndex >= 0) {
          if (replaceExisting) {
            finalCategories[existingIndex] = {
              ...importedCategory,
              modifiedDate: new Date().toISOString()
            };
            importedCount++;
          } else {
            skippedCount++;
          }
        } else {
          finalCategories.push({
            ...importedCategory,
            createdDate: importedCategory.createdDate || new Date().toISOString(),
            modifiedDate: new Date().toISOString()
          });
          importedCount++;
        }
      }

      await this.saveCategories(finalCategories, context);

      Log.info(LOG_SOURCE, `Import completed: ${importedCount} imported, ${skippedCount} skipped`);
      return finalCategories;

    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw new Error(`Failed to import categories: ${(error as Error).message}`);
    }
  }

  /**
   * Reset categories to defaults
   */
  public static async resetToDefaults(context?: WebPartContext): Promise<ILinkCategory[]> {
    try {
      const defaultCategories = this.DEFAULT_CATEGORIES.map(cat => ({
        ...cat,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString()
      }));

      await this.saveCategories(defaultCategories, context);
      Log.info(LOG_SOURCE, 'Categories reset to defaults');
      return defaultCategories;

    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }

  /**
   * Generate a unique category ID from name
   */
  private static generateCategoryId(name: string): string {
    const baseId = name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    return `${baseId}-${Date.now().toString(36)}`;
  }

  /**
   * Get a random color for new categories
   */
  private static getRandomColor(): string {
    const colors = [
      '#0078d4', // Blue
      '#d83b01', // Orange
      '#107c10', // Green
      '#5c2d91', // Purple
      '#e81123', // Red
      '#00bcf2', // Cyan
      '#8764b8', // Light Purple
      '#00b7c3', // Teal
      '#498205', // Dark Green
      '#ff8c00'  // Dark Orange
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Validate category data
   */
  public static validateCategory(category: Partial<ILinkCategory>): string[] {
    const errors: string[] = [];

    if (!category.name?.trim()) {
      errors.push('Category name is required');
    } else if (category.name.length > 50) {
      errors.push('Category name must be 50 characters or less');
    }

    if (category.description && category.description.length > 200) {
      errors.push('Category description must be 200 characters or less');
    }

    if (category.sortOrder !== undefined && (category.sortOrder < 1 || category.sortOrder > 1000)) {
      errors.push('Sort order must be between 1 and 1000');
    }

    if (category.color && !/^#[0-9A-Fa-f]{6}$/.test(category.color)) {
      errors.push('Color must be a valid hex color code (e.g., #0078d4)');
    }

    return errors;
  }
}