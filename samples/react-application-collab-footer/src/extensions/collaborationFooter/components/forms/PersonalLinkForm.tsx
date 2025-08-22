import * as React from 'react';
import { BaseLinkForm, IBaseLinkFormData } from './BaseLinkForm';

export interface IPersonalLinkFormData extends IBaseLinkFormData {}

export interface IPersonalLinkFormProps {
  formData: IPersonalLinkFormData;
  onSave: (formData: IPersonalLinkFormData) => void;
  onCancel: () => void;
  onFormDataChange: (formData: IPersonalLinkFormData) => void;
  onShowIconGallery: () => void;
  availableCategories: { key: string; text: string }[];
  isLoading?: boolean;
  isEditMode?: boolean;
}

export const PersonalLinkForm: React.FC<IPersonalLinkFormProps> = ({
  formData,
  onSave,
  onCancel,
  onFormDataChange,
  onShowIconGallery,
  availableCategories,
  isLoading = false,
  isEditMode = false
}) => {
  return (
    <BaseLinkForm<IPersonalLinkFormData>
      formData={formData}
      onSave={onSave}
      onCancel={onCancel}
      onFormDataChange={onFormDataChange}
      onShowIconGallery={onShowIconGallery}
      availableCategories={availableCategories}
      isLoading={isLoading}
      isEditMode={isEditMode}
      formTitle={isEditMode ? 'Edit Personal Link' : 'Add Personal Link'}
    />
  );
};