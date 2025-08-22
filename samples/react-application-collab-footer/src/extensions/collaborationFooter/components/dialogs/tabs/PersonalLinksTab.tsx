import * as React from 'react';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { SearchAndFilterControls } from '../../shared/SearchAndFilterControls';
import { LinkList } from '../../shared/LinkList';
import { PersonalLinkForm } from '../../forms/PersonalLinkForm';
import { useBulkSelection } from '../../../hooks/useBulkSelection';
import styles from './PersonalLinksTab.module.scss';

export interface IPersonalLinksTabProps {
  links: IContextualMenuItem[];
  onLinksChange: (links: IContextualMenuItem[]) => void;
  state: {
    searchQuery: string;
    selectedCategory: string;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
  };
  onStateChange: (state: any) => void;
  showAddForm: boolean;
  onShowAddForm: (show: boolean) => void;
  newLinkFormData: any;
  onFormDataChange: (data: any) => void;
  onSave: () => void;
  availableCategories: any[];
  onShowIconGallery: () => void;
  isLoading: boolean;
  onSaveLinks?: (links: IContextualMenuItem[]) => Promise<boolean>;
  footerService?: any; // For direct persistence
}

export const PersonalLinksTab: React.FC<IPersonalLinksTabProps> = ({
  links,
  onLinksChange,
  state,
  onStateChange,
  showAddForm,
  onShowAddForm,
  newLinkFormData,
  onFormDataChange,
  onSave,
  availableCategories,
  onShowIconGallery,
  isLoading,
  onSaveLinks
}) => {
  const bulkSelection = useBulkSelection();

  // Filter and sort links
  const filteredAndSortedLinks = React.useMemo(() => {
    let filtered = [...links];

    // Apply category filter
    if (state.selectedCategory !== 'all') {
      filtered = filtered.filter(link => {
        const linkCategory = (link.data as any)?.category?.toLowerCase() || 'personal';
        return linkCategory === state.selectedCategory;
      });
    }

    // Apply search filter
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(link =>
        link.name?.toLowerCase().includes(query) ||
        (link.data as any)?.description?.toLowerCase().includes(query) ||
        (link.data as any)?.category?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = '';
      let bValue = '';

      switch (state.sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'category':
          aValue = (a.data as any)?.category || 'Personal';
          bValue = (b.data as any)?.category || 'Personal';
          break;
        case 'lastUsed':
          aValue = (a.data as any)?.lastUsed || '1970-01-01';
          bValue = (b.data as any)?.lastUsed || '1970-01-01';
          break;
        default:
          aValue = a.name || '';
          bValue = b.name || '';
      }

      const comparison = aValue.localeCompare(bValue);
      return state.sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [links, state.searchQuery, state.selectedCategory, state.sortBy, state.sortDirection]);

  const sortOptions = [
    { key: 'name', text: 'Name' },
    { key: 'category', text: 'Category' },
    { key: 'lastUsed', text: 'Last Used' }
  ];

  const handleDeleteSelected = async () => {
    const selectedKeys = Array.from(bulkSelection.selectedItems);
    const updatedLinks = links.filter(link => !selectedKeys.includes(link.key || ''));
    
    if (onSaveLinks) {
      const success = await onSaveLinks(updatedLinks);
      if (success) {
        onLinksChange(updatedLinks);
        bulkSelection.deselectAllItems();
      }
    } else {
      onLinksChange(updatedLinks);
      bulkSelection.deselectAllItems();
    }
  };

  const handleSelectAll = () => {
    bulkSelection.selectAllItems(filteredAndSortedLinks);
  };

  const handleDeselectAll = () => {
    bulkSelection.deselectAllItems();
  };

  const handleEditLink = (link: IContextualMenuItem) => {
    // Populate form data with link data for editing
    const linkData = {
      title: link.name || '',
      url: link.href || '',
      description: (link.data as any)?.description || '',
      iconName: (link.data as any)?.iconName || 'Link',
      iconUrl: (link.data as any)?.iconUrl || '',
      category: (link.data as any)?.category || 'Personal',
      id: (link.data as any)?.id // Include ID for edit mode detection
    };
    
    onFormDataChange(linkData);
    onShowAddForm(true);
  };

  const handleDeleteLink = async (linkKey: string) => {
    const updatedLinks = links.filter(link => link.key !== linkKey);
    
    if (onSaveLinks) {
      const success = await onSaveLinks(updatedLinks);
      if (success) {
        onLinksChange(updatedLinks);
      }
    } else {
      onLinksChange(updatedLinks);
    }
  };

  return (
    <div className={styles.tabContent}>
      {/* Tab Header */}
      <div className={styles.tabHeader}>
        <div className={styles.tabHeaderText}>
          <h3>Personal Links</h3>
          <p>Manage your personal shortcuts and frequently used links. Create, edit, and organize your custom links.</p>
        </div>
        <PrimaryButton
          text="Add Personal Link"
          iconProps={{ iconName: 'Add' }}
          onClick={() => onShowAddForm(true)}
          styles={{ 
            root: { 
              borderRadius: '8px',
              fontWeight: '600'
            } 
          }}
        />
      </div>

      {/* Search and Filter Controls */}
      <div className={styles.filterSection}>
        <SearchAndFilterControls
        searchValue={state.searchQuery}
        onSearchChange={(value) => onStateChange({ ...state, searchQuery: value })}
        searchPlaceholder="Search personal links..."
        selectedCategory={state.selectedCategory}
        onCategoryChange={(category) => onStateChange({ ...state, selectedCategory: category })}
        categoryOptions={availableCategories}
        sortBy={state.sortBy}
        onSortChange={(sortBy) => onStateChange({ ...state, sortBy })}
        sortOptions={sortOptions}
        sortDirection={state.sortDirection}
        onSortDirectionChange={(direction) => onStateChange({ ...state, sortDirection: direction })}
        additionalFilters={
          bulkSelection.bulkSelectionMode && (
            <div className={styles.bulkActions}>
              {bulkSelection.selectedCount > 0 ? (
                <>
                  <span className={styles.selectionInfo}>
                    {bulkSelection.selectedCount} item(s) selected
                  </span>
                  <DefaultButton
                    text="Deselect All"
                    onClick={handleDeselectAll}
                    iconProps={{ iconName: 'Clear' }}
                  />
                  <DefaultButton
                    text="Delete Selected"
                    onClick={handleDeleteSelected}
                    iconProps={{ iconName: 'Delete' }}
                    styles={{ root: { color: '#d13438' } }}
                  />
                </>
              ) : (
                <DefaultButton
                  text="Select All"
                  onClick={handleSelectAll}
                  iconProps={{ iconName: 'CheckboxComposite' }}
                />
              )}
            </div>
          )
        }
        />
      </div>

      {/* Links List */}
      <div className={styles.linkListSection}>
        <LinkList
        links={filteredAndSortedLinks}
        onLinksChange={onLinksChange}
        allLinks={links}
        bulkSelection={bulkSelection}
        showBulkSelection={true}
        allowEdit={true}
        allowDelete={true}
        onEditLink={handleEditLink}
        onDeleteLink={handleDeleteLink}
        emptyMessage="No personal links found. Add your first personal link to get started!"
        showDetails={true}
        maxHeight="500px"
        />
      </div>

      {/* Add/Edit Personal Link Form */}
      {showAddForm && (
        <PersonalLinkForm
          formData={newLinkFormData}
          onSave={onSave}
          onCancel={() => onShowAddForm(false)}
          onFormDataChange={onFormDataChange}
          onShowIconGallery={onShowIconGallery}
          availableCategories={availableCategories}
          isLoading={isLoading}
          isEditMode={!!newLinkFormData.id} // Edit mode if ID exists
        />
      )}
    </div>
  );
};