import * as React from 'react';
import { useState, useCallback } from 'react';
import { LinkValidationService } from '../../services/linkValidationService';
import { TextField } from '@fluentui/react/lib/TextField';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Icon } from '@fluentui/react/lib/Icon';
import styles from './BaseLinkForm.module.scss';

export interface IBaseLinkFormData {
  id?: number | string;
  title: string;
  url: string;
  description: string;
  iconName: string;
  iconUrl: string;
  category: string;
}

export interface IBaseLinkFormProps<T extends IBaseLinkFormData = IBaseLinkFormData> {
  formData: T;
  onSave: (formData: T) => void;
  onCancel: () => void;
  onFormDataChange: (formData: T) => void;
  onShowIconGallery: () => void;
  availableCategories: { key: string; text: string }[];
  isLoading?: boolean;
  isEditMode?: boolean;
  formTitle?: string;
  children?: React.ReactNode; // For additional fields like people picker, toggles
}

export const BaseLinkForm = <T extends IBaseLinkFormData = IBaseLinkFormData>({
  formData,
  onSave,
  onCancel,
  onFormDataChange,
  onShowIconGallery,
  availableCategories,
  isLoading = false,
  isEditMode = false,
  formTitle,
  children
}: IBaseLinkFormProps<T>) => {
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState<boolean>(false);
  const [customCategory, setCustomCategory] = useState<string>('');

  const handleSave = useCallback(() => {
    if (!formData.title.trim() || !formData.url.trim() || !LinkValidationService.isValidUrl(formData.url)) {
      return;
    }
    onSave(formData);
  }, [formData, onSave]);

  const handleCategoryChange = useCallback((_, option) => {
    if (option?.key === 'custom') {
      setShowCustomCategoryInput(true);
      setCustomCategory('');
    } else {
      setShowCustomCategoryInput(false);
      onFormDataChange({ ...formData, category: option?.key as string || 'General' });
    }
  }, [formData, onFormDataChange]);

  const handleAddCustomCategory = useCallback(() => {
    if (customCategory.trim()) {
      onFormDataChange({ ...formData, category: customCategory.trim() });
      setShowCustomCategoryInput(false);
      setCustomCategory('');
    }
  }, [customCategory, formData, onFormDataChange]);

  return (
    <div className={styles.baseLinkForm}>
      <div className={styles.formHeader}>
        <h4>{formTitle || (isEditMode ? 'Edit Link' : 'Add Link')}</h4>
      </div>
      
      <div className={styles.formFields}>
        <TextField
          label="Link Title"
          placeholder="Enter a descriptive title"
          value={formData.title}
          onChange={(_, value) => onFormDataChange({ ...formData, title: value || '' })}
          required
        />
        
        <TextField
          label="URL"
          placeholder="https://example.com"
          value={formData.url}
          onChange={(_, value) => onFormDataChange({ ...formData, url: value || '' })}
          required
        />
        
        <TextField
          label="Description (Optional)"
          placeholder="Brief description of this link"
          value={formData.description}
          onChange={(_, value) => onFormDataChange({ ...formData, description: value || '' })}
        />
        
        <Dropdown
          label="Category"
          selectedKey={showCustomCategoryInput ? 'custom' : formData.category}
          onChange={handleCategoryChange}
          options={[
            ...availableCategories,
            { key: 'custom', text: '+ Create New Category' }
          ]}
        />
        
        {showCustomCategoryInput && (
          <div className={styles.customCategorySection}>
            <TextField
              label="New Category Name"
              placeholder="Enter category name"
              value={customCategory}
              onChange={(_, value) => setCustomCategory(value || '')}
              styles={{ root: { flex: 1 } }}
            />
            <div className={styles.customCategoryActions}>
              <PrimaryButton
                text="Add"
                onClick={handleAddCustomCategory}
                disabled={!customCategory.trim()}
              />
              <DefaultButton
                text="Cancel"
                onClick={() => {
                  setShowCustomCategoryInput(false);
                  setCustomCategory('');
                }}
              />
            </div>
          </div>
        )}
        
        <div className={styles.iconSection}>
          <label className={styles.iconLabel}>Icon</label>
          <div className={styles.iconPreview}>
            {formData.iconUrl ? (
              <img 
                src={formData.iconUrl} 
                alt="Selected icon"
                className={styles.iconImage}
              />
            ) : (
              <Icon iconName={formData.iconName || 'Link'} className={styles.iconFluentUI} />
            )}
            <span className={styles.iconName}>
              {formData.iconUrl ? 'Custom Image' : formData.iconName || 'Link'}
            </span>
            <DefaultButton
              text="Choose Icon"
              iconProps={{ iconName: 'Edit' }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onShowIconGallery();
              }}
              className={styles.chooseIconButton}
            />
          </div>
        </div>
        
        {/* Additional fields from child components */}
        {children}
      </div>
      
      <div className={styles.formActions}>
        <PrimaryButton
          text="Save Link"
          onClick={handleSave}
          disabled={!formData.title.trim() || !formData.url.trim() || !LinkValidationService.isValidUrl(formData.url) || isLoading}
        />
        <DefaultButton
          text="Cancel"
          onClick={onCancel}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};