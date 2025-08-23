import * as React from 'react';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SearchAndFilterControls } from '../../shared/SearchAndFilterControls';
import { LinkList } from '../../shared/LinkList';
import { OrganizationLinkForm } from '../../forms/OrganizationLinkForm';
import { useBulkSelection } from '../../../hooks/useBulkSelection';
import styles from './OrganizationLinksTab.module.scss';

export interface IOrganizationLinksTabProps {
  links: IContextualMenuItem[];
  allAvailableLinks: IContextualMenuItem[];
  onLinksChange: (links: IContextualMenuItem[]) => void;
  state: {
    searchQuery: string;
    selectedCategory: string;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    currentPage: number;
    itemsPerPage: number;
  };
  onStateChange: (state: any) => void;
  showAddForm: boolean;
  onShowAddForm: (show: boolean) => void;
  newLinkFormData: any;
  onFormDataChange: (data: any) => void;
  onSave: () => void;
  isAdmin: boolean;
  availableCategories: any[];
  onShowIconGallery: () => void;
  isLoading: boolean;
  context: WebPartContext;
  footerService?: any; // For saving organization links
}

export const OrganizationLinksTab: React.FC<IOrganizationLinksTabProps> = ({
  links,
  allAvailableLinks,
  onLinksChange,
  state,
  onStateChange,
  showAddForm,
  onShowAddForm,
  newLinkFormData,
  onFormDataChange,
  onSave,
  isAdmin,
  availableCategories,
  onShowIconGallery,
  isLoading,
  context,
  footerService
}) => {
  const bulkSelection = useBulkSelection();

  // Filter and sort links
  const filteredAndSortedLinks = React.useMemo(() => {
    let filtered = [...allAvailableLinks];

    // Apply category filter
    if (state.selectedCategory !== 'all') {
      filtered = filtered.filter(link => {
        const linkCategory = (link.data as any)?.category?.toLowerCase() || 'general';
        return linkCategory === state.selectedCategory.toLowerCase();
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
        case 'category':
          aValue = (a.data as any)?.category || 'General';
          bValue = (b.data as any)?.category || 'General';
          break;
        case 'mandatory':
          aValue = (a.data as any)?.isMandatory ? 'Mandatory' : 'Optional';
          bValue = (b.data as any)?.isMandatory ? 'Mandatory' : 'Optional';
          break;
        default:
          aValue = a.name || '';
          bValue = b.name || '';
      }

      const comparison = aValue.localeCompare(bValue);
      return state.sortDirection === 'asc' ? comparison : -comparison;
    });

    // Apply pagination for display
    const totalItems = filtered.length;
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    const paginatedLinks = filtered.slice(startIndex, endIndex);

    return {
      links: paginatedLinks,
      totalItems,
      totalPages: Math.ceil(totalItems / state.itemsPerPage)
    };
  }, [allAvailableLinks, state.searchQuery, state.selectedCategory, state.sortBy, state.sortDirection, state.currentPage, state.itemsPerPage]);

  const { links: displayedLinks, totalItems, totalPages } = filteredAndSortedLinks;

  const sortOptions = [
    { key: 'name', text: 'Name' },
    { key: 'category', text: 'Category' },
    { key: 'mandatory', text: 'Type (Mandatory/Optional)' }
  ];

  const handleEditLink = (link: IContextualMenuItem) => {
    // Populate form data with link data for editing
    const linkData = {
      title: link.name || '',
      url: link.href || '',
      description: (link.data as any)?.description || '',
      iconName: (link.data as any)?.iconName || 'Link',
      iconUrl: (link.data as any)?.iconUrl || '',
      category: (link.data as any)?.category || 'General',
      isMandatory: (link.data as any)?.isMandatory || false,
      targetUsers: (link.data as any)?.targetUsers || [],
      validFrom: (link.data as any)?.validFrom || '',
      validTo: (link.data as any)?.validTo || '',
      id: (link.data as any)?.id
    };
    
    onFormDataChange(linkData);
    onShowAddForm(true);
  };

  const handleSelectAll = () => {
    bulkSelection.selectAllItems(displayedLinks);
  };

  const handleDeselectAll = () => {
    bulkSelection.deselectAllItems();
  };

  const handleDeleteSelected = () => {
    const selectedKeys = Array.from(bulkSelection.selectedItems);
    const updatedLinks = allAvailableLinks.filter(link => !selectedKeys.includes(link.key || ''));
    onLinksChange(updatedLinks);
    bulkSelection.deselectAllItems();
  };

  return (
    <div className={styles.tabContent}>
      {/* Tab Header */}
      <div className={styles.tabHeader}>
        <div className={styles.tabHeaderText}>
          <h3>Organization Links</h3>
          <p>Manage links available to your organization. Create, edit, and configure organization-wide links.</p>
        </div>
        {isAdmin && (
          <PrimaryButton
            text="Add Organization Link"
            iconProps={{ iconName: 'Add' }}
            onClick={() => onShowAddForm(true)}
            styles={{ 
              root: { 
                borderRadius: '8px',
                fontWeight: '600'
              } 
            }}
          />
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className={styles.filterSection}>
        <SearchAndFilterControls
        searchValue={state.searchQuery}
        onSearchChange={(query) => onStateChange({ ...state, searchQuery: query })}
        selectedCategory={state.selectedCategory}
        onCategoryChange={(category) => {
          onStateChange({ ...state, selectedCategory: category });
        }}
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
                  {isAdmin && (
                    <DefaultButton
                      text="Delete Selected"
                      onClick={handleDeleteSelected}
                      iconProps={{ iconName: 'Delete' }}
                      styles={{ root: { color: '#d13438' } }}
                    />
                  )}
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
        links={displayedLinks}
        onLinksChange={onLinksChange}
        allLinks={allAvailableLinks}
        bulkSelection={bulkSelection}
        showBulkSelection={isAdmin} // Only show bulk selection for admins
        allowEdit={isAdmin} // Only allow editing for admins
        allowDelete={isAdmin} // Only allow deletion for admins
        onEditLink={handleEditLink}
        emptyMessage="No organization links found. Contact your administrator to add organization links."
        showDetails={true}
        maxHeight="500px"
        />
      </div>

      {/* Pagination - if needed */}
      {totalPages > 1 && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <DefaultButton
            text="Previous"
            disabled={state.currentPage === 1}
            onClick={() => onStateChange({ ...state, currentPage: state.currentPage - 1 })}
            iconProps={{ iconName: 'ChevronLeft' }}
          />
          <span style={{ margin: '0 16px', color: '#666' }}>
            Page {state.currentPage} of {totalPages} ({totalItems} items)
          </span>
          <DefaultButton
            text="Next"
            disabled={state.currentPage === totalPages}
            onClick={() => onStateChange({ ...state, currentPage: state.currentPage + 1 })}
            iconProps={{ iconName: 'ChevronRight' }}
          />
        </div>
      )}

      {/* Edit Organization Link Form - Only shown for admins */}
      {showAddForm && isAdmin && (
        <OrganizationLinkForm
          formData={newLinkFormData}
          onSave={onSave}
          onCancel={() => onShowAddForm(false)}
          onFormDataChange={onFormDataChange}
          onShowIconGallery={onShowIconGallery}
          availableCategories={availableCategories}
          isLoading={isLoading}
          context={context}
          isEditMode={!!newLinkFormData.id} // Edit mode if ID exists
        />
      )}
    </div>
  );
};