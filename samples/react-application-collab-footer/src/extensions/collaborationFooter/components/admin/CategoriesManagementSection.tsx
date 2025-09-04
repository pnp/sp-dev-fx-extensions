import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { Text } from '@fluentui/react/lib/Text';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { DetailsList, IColumn, SelectionMode } from '@fluentui/react/lib/DetailsList';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { ColorPicker } from '@fluentui/react/lib/ColorPicker';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { Icon } from '@fluentui/react/lib/Icon';
import { Stack } from '@fluentui/react/lib/Stack';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { CategoryService, ILinkCategory, ICategoryStats } from '../../services/categoryService';
import styles from './CategoriesManagementSection.module.scss';

export interface ICategoriesManagementSectionProps {
  context: WebPartContext;
  links: IContextualMenuItem[];
  onStatusUpdate: (message: string, isError?: boolean) => void;
  onCategoriesChanged: () => void;
}

export const CategoriesManagementSection: React.FC<ICategoriesManagementSectionProps> = ({
  context,
  links,
  onStatusUpdate,
  onCategoriesChanged
}) => {
  const [categories, setCategories] = useState<ILinkCategory[]>([]);
  const [categoryStats, setCategoryStats] = useState<ICategoryStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showEditPanel, setShowEditPanel] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<ILinkCategory | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<ILinkCategory>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Icon options for categories
  const iconOptions = [
    { key: 'Globe', text: 'Globe' },
    { key: 'Tag', text: 'Tag' },
    { key: 'Library', text: 'Library' },
    { key: 'Chat', text: 'Chat' },
    { key: 'OfficeLogo', text: 'Office Logo' },
    { key: 'Settings', text: 'Settings' },
    { key: 'People', text: 'People' },
    { key: 'Cloud', text: 'Cloud' },
    { key: 'Home', text: 'Home' },
    { key: 'Work', text: 'Work' },
    { key: 'Education', text: 'Education' },
    { key: 'Medical', text: 'Medical' },
    { key: 'ComplianceAudit', text: 'Compliance' },
    { key: 'Financial', text: 'Financial' },
    { key: 'News', text: 'News' },
    { key: 'Help', text: 'Help' }
  ];

  // Load categories and stats
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [categoriesData, statsData] = await Promise.all([
        CategoryService.getCategories(context),
        CategoryService.getCategoryStats(links, context)
      ]);
      
      setCategories(categoriesData);
      setCategoryStats(statsData);
      
    } catch (error) {
      onStatusUpdate(`Failed to load categories: ${(error as Error).message}`, true);
    } finally {
      setIsLoading(false);
    }
  }, [context, links, onStatusUpdate]);

  // Initialize component
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle create category
  const handleCreateCategory = useCallback(() => {
    setSelectedCategory(null);
    setEditingCategory({
      name: '',
      description: '',
      icon: 'Tag',
      color: '#0078d4',
      isActive: true,
      sortOrder: categories.length + 1
    });
    setValidationErrors([]);
    setShowEditPanel(true);
  }, [categories.length]);

  // Handle edit category
  const handleEditCategory = useCallback((category: ILinkCategory) => {
    setSelectedCategory(category);
    setEditingCategory({ ...category });
    setValidationErrors([]);
    setShowEditPanel(true);
  }, []);

  // Handle delete category
  const handleDeleteCategory = useCallback((category: ILinkCategory) => {
    setSelectedCategory(category);
    setShowDeleteDialog(true);
  }, []);

  // Save category (create or update)
  const handleSaveCategory = useCallback(async () => {
    try {
      // Validate category data
      const errors = CategoryService.validateCategory(editingCategory);
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      setIsLoading(true);

      if (selectedCategory) {
        // Update existing category
        await CategoryService.updateCategory(selectedCategory.id, editingCategory, context);
        onStatusUpdate(`Updated category "${editingCategory.name}"`);
      } else {
        // Create new category
        await CategoryService.createCategory(editingCategory, context);
        onStatusUpdate(`Created category "${editingCategory.name}"`);
      }

      setShowEditPanel(false);
      await loadData();
      onCategoriesChanged();

    } catch (error) {
      onStatusUpdate(`Failed to save category: ${(error as Error).message}`, true);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, editingCategory, context, onStatusUpdate, loadData, onCategoriesChanged]);

  // Confirm delete category
  const handleConfirmDelete = useCallback(async () => {
    if (!selectedCategory) return;

    try {
      setIsLoading(true);
      await CategoryService.deleteCategory(selectedCategory.id, context, links);
      onStatusUpdate(`Deleted category "${selectedCategory.name}"`);
      
      setShowDeleteDialog(false);
      await loadData();
      onCategoriesChanged();

    } catch (error) {
      onStatusUpdate(`Failed to delete category: ${(error as Error).message}`, true);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, context, links, onStatusUpdate, loadData, onCategoriesChanged]);

  // Reset to defaults
  const handleResetToDefaults = useCallback(async () => {
    try {
      setIsLoading(true);
      await CategoryService.resetToDefaults(context);
      onStatusUpdate('Categories reset to defaults');
      
      await loadData();
      onCategoriesChanged();

    } catch (error) {
      onStatusUpdate(`Failed to reset categories: ${(error as Error).message}`, true);
    } finally {
      setIsLoading(false);
    }
  }, [context, onStatusUpdate, loadData, onCategoriesChanged]);

  // Export categories
  const handleExportCategories = useCallback(async () => {
    try {
      const categoriesJson = await CategoryService.exportCategories(context);
      const blob = new Blob([categoriesJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `footer-categories-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      onStatusUpdate('Categories exported successfully');
      
    } catch (error) {
      onStatusUpdate(`Failed to export categories: ${(error as Error).message}`, true);
    }
  }, [context, onStatusUpdate]);

  // Import categories
  const handleImportCategories = useCallback(() => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        setIsLoading(true);
        const content = await file.text();
        await CategoryService.importCategories(content, context, false);
        onStatusUpdate('Categories imported successfully');
        
        await loadData();
        onCategoriesChanged();

      } catch (error) {
        onStatusUpdate(`Failed to import categories: ${(error as Error).message}`, true);
      } finally {
        setIsLoading(false);
      }
    };
    fileInput.click();
  }, [context, onStatusUpdate, loadData, onCategoriesChanged]);

  // Columns for categories list
  const categoriesColumns: IColumn[] = [
    {
      key: 'status',
      name: '',
      fieldName: 'status',
      minWidth: 24,
      maxWidth: 24,
      onRender: (item: ILinkCategory) => (
        <Icon 
          iconName={item.isActive ? 'CompletedSolid' : 'ErrorBadge'} 
          style={{ color: item.isActive ? '#107c10' : '#d13438' }}
        />
      )
    },
    {
      key: 'icon',
      name: '',
      fieldName: 'icon',
      minWidth: 32,
      maxWidth: 32,
      onRender: (item: ILinkCategory) => (
        <Icon iconName={item.icon} style={{ color: item.color }} />
      )
    },
    {
      key: 'name',
      name: 'Name',
      fieldName: 'name',
      minWidth: 150,
      maxWidth: 200,
      isResizable: true
    },
    {
      key: 'description',
      name: 'Description',
      fieldName: 'description',
      minWidth: 200,
      maxWidth: 300,
      isResizable: true
    },
    {
      key: 'linkCount',
      name: 'Links',
      fieldName: 'linkCount',
      minWidth: 60,
      maxWidth: 80,
      onRender: (item: ILinkCategory) => {
        const count = links.filter(link => 
          (link as any).category === item.id || (link as any).category === item.name
        ).length;
        return <Text>{count}</Text>;
      }
    },
    {
      key: 'sortOrder',
      name: 'Order',
      fieldName: 'sortOrder',
      minWidth: 60,
      maxWidth: 80
    },
    {
      key: 'actions',
      name: 'Actions',
      fieldName: 'actions',
      minWidth: 120,
      maxWidth: 120,
      onRender: (item: ILinkCategory) => (
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <DefaultButton
            iconProps={{ iconName: 'Edit' }}
            onClick={() => handleEditCategory(item)}
            title="Edit category"
          />
          <DefaultButton
            iconProps={{ iconName: 'Delete' }}
            onClick={() => handleDeleteCategory(item)}
            title="Delete category"
            disabled={item.id === 'general'} // Prevent deletion of default general category
          />
        </Stack>
      )
    }
  ];

  return (
    <div className={styles.categoriesManagementSection}>
      <div className={styles.sectionHeader}>
        <Text variant="large" className={styles.sectionTitle}>Categories Management</Text>
        <Text variant="medium" className={styles.sectionDescription}>
          Organize your links with custom categories
        </Text>
      </div>

      {/* Statistics */}
      {categoryStats && (
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <Text variant="large" className={styles.statValue}>{categoryStats.totalCategories}</Text>
            <Text variant="small" className={styles.statLabel}>Total Categories</Text>
          </div>
          <div className={styles.statCard}>
            <Text variant="large" className={styles.statValue}>{categoryStats.activeCategories}</Text>
            <Text variant="small" className={styles.statLabel}>Active Categories</Text>
          </div>
          <div className={styles.statCard}>
            <Text variant="large" className={styles.statValue}>{categoryStats.categoriesWithLinks}</Text>
            <Text variant="small" className={styles.statLabel}>Used Categories</Text>
          </div>
          <div className={styles.statCard}>
            <Text variant="medium" className={styles.statValue}>{categoryStats.mostPopularCategory}</Text>
            <Text variant="small" className={styles.statLabel}>Most Popular</Text>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <PrimaryButton
          text="Add Category"
          iconProps={{ iconName: 'Add' }}
          onClick={handleCreateCategory}
          disabled={isLoading}
        />
        <DefaultButton
          text="Import"
          iconProps={{ iconName: 'Upload' }}
          onClick={handleImportCategories}
          disabled={isLoading}
        />
        <DefaultButton
          text="Export"
          iconProps={{ iconName: 'Download' }}
          onClick={handleExportCategories}
          disabled={isLoading}
        />
        <DefaultButton
          text="Reset to Defaults"
          iconProps={{ iconName: 'Refresh' }}
          onClick={handleResetToDefaults}
          disabled={isLoading}
        />
      </div>

      {/* Categories List */}
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <Spinner size={SpinnerSize.large} label="Loading categories..." />
        </div>
      ) : (
        <DetailsList
          items={categories}
          columns={categoriesColumns}
          setKey="categoriesList"
          layoutMode={0}
          selectionMode={SelectionMode.none}
          compact={false}
        />
      )}

      {/* Edit/Create Category Panel */}
      <Panel
        isOpen={showEditPanel}
        onDismiss={() => setShowEditPanel(false)}
        type={PanelType.medium}
        headerText={selectedCategory ? 'Edit Category' : 'Create New Category'}
        closeButtonAriaLabel="Close panel"
      >
        <div className={styles.editForm}>
          {validationErrors.length > 0 && (
            <MessageBar messageBarType={MessageBarType.error}>
              {validationErrors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </MessageBar>
          )}

          <TextField
            label="Category Name"
            placeholder="Enter category name"
            value={editingCategory.name || ''}
            onChange={(_, value) => setEditingCategory({ ...editingCategory, name: value || '' })}
            required
          />

          <TextField
            label="Description"
            placeholder="Enter category description (optional)"
            value={editingCategory.description || ''}
            onChange={(_, value) => setEditingCategory({ ...editingCategory, description: value || '' })}
            multiline
            rows={3}
          />

          <Dropdown
            label="Icon"
            selectedKey={editingCategory.icon}
            onChange={(_, option) => setEditingCategory({ ...editingCategory, icon: option?.key as string })}
            options={iconOptions}
          />

          <div className={styles.colorPickerContainer}>
            <Text variant="medium" className={styles.colorLabel}>Category Color</Text>
            <ColorPicker
              color={editingCategory.color || '#0078d4'}
              onChange={(_, color) => setEditingCategory({ ...editingCategory, color: color.str })}
              alphaType="none"
            />
          </div>

          <TextField
            label="Sort Order"
            type="number"
            value={editingCategory.sortOrder?.toString() || ''}
            onChange={(_, value) => setEditingCategory({ ...editingCategory, sortOrder: parseInt(value || '1') })}
          />

          <Toggle
            label="Active"
            checked={editingCategory.isActive !== false}
            onChange={(_, checked) => setEditingCategory({ ...editingCategory, isActive: !!checked })}
            onText="Category is active"
            offText="Category is inactive"
          />

          <div className={styles.panelActions}>
            <PrimaryButton
              text={selectedCategory ? 'Update Category' : 'Create Category'}
              onClick={handleSaveCategory}
              disabled={isLoading || !editingCategory.name?.trim()}
            />
            <DefaultButton
              text="Cancel"
              onClick={() => setShowEditPanel(false)}
              disabled={isLoading}
            />
          </div>
        </div>
      </Panel>

      {/* Delete Confirmation Dialog */}
      <Dialog
        hidden={!showDeleteDialog}
        onDismiss={() => setShowDeleteDialog(false)}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Delete Category',
          subText: `Are you sure you want to delete the category "${selectedCategory?.name}"? This action cannot be undone.`
        }}
        modalProps={{ isBlocking: true }}
      >
        <DialogFooter>
          <PrimaryButton
            text="Delete"
            onClick={handleConfirmDelete}
            disabled={isLoading}
          />
          <DefaultButton
            text="Cancel"
            onClick={() => setShowDeleteDialog(false)}
            disabled={isLoading}
          />
        </DialogFooter>
      </Dialog>
    </div>
  );
};