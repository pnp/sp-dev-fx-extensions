import * as React from 'react';
import { useCallback } from 'react';
import { TextField } from '@fluentui/react/lib/TextField';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { BaseLinkForm, IBaseLinkFormData } from './BaseLinkForm';
import styles from './OrganizationLinkForm.module.scss';

export interface ITargetUser {
  id: string;
  loginName: string;
  displayName: string;
  email: string;
  imageUrl?: string;
}

export interface IOrganizationLinkFormData extends IBaseLinkFormData {
  targetUsers: ITargetUser[];
  isMandatory: boolean;
  validFrom: string;
  validTo: string;
}

export interface IOrganizationLinkFormProps {
  context: WebPartContext;
  formData: IOrganizationLinkFormData;
  onSave: (formData: IOrganizationLinkFormData) => void;
  onCancel: () => void;
  onFormDataChange: (formData: IOrganizationLinkFormData) => void;
  onShowIconGallery: () => void;
  availableCategories: { key: string; text: string }[];
  isLoading?: boolean;
  isEditMode?: boolean;
}

export const OrganizationLinkForm: React.FC<IOrganizationLinkFormProps> = ({
  context,
  formData,
  onSave,
  onCancel,
  onFormDataChange,
  onShowIconGallery,
  availableCategories,
  isLoading = false,
  isEditMode = false
}) => {
  const handleTargetUsersChange = useCallback((items: any[]) => {
    const targetUsers: ITargetUser[] = items?.map(item => ({
      id: item.id || item.text || '',
      loginName: item.secondaryText || item.text || '',
      displayName: item.text || '',
      email: item.secondaryText || '',
      imageUrl: item.imageUrl
    })) || [];
    onFormDataChange({ ...formData, targetUsers });
  }, [formData, onFormDataChange]);

  return (
    <BaseLinkForm<IOrganizationLinkFormData>
      formData={formData}
      onSave={onSave}
      onCancel={onCancel}
      onFormDataChange={onFormDataChange}
      onShowIconGallery={onShowIconGallery}
      availableCategories={availableCategories}
      isLoading={isLoading}
      isEditMode={isEditMode}
      formTitle={isEditMode ? 'Edit Organization Link' : 'Add Organization Link'}
    >
      {/* Organization-specific fields */}
      <div className={styles.peoplePickerSection}>
        <PeoplePicker
          context={context as any}
          titleText="Target Users (leave empty for everyone)"
          personSelectionLimit={20}
          groupName=""
          showtooltip={true}
          defaultSelectedUsers={formData.targetUsers?.map(u => u.loginName) || []}
          onChange={handleTargetUsersChange}
          principalTypes={[PrincipalType.User, PrincipalType.SharePointGroup, PrincipalType.SecurityGroup]}
          resolveDelay={1000}
        />
      </div>
      
      <div className={styles.mandatoryToggleSection}>
        <Toggle
          label="Mandatory Link"
          checked={formData.isMandatory}
          onChange={(_, checked) => onFormDataChange({ ...formData, isMandatory: !!checked })}
          onText="Mandatory for all users"
          offText="Optional for users"
        />
      </div>
      
      <div className={styles.dateFieldsSection}>
        <TextField
          label="Valid From (Optional)"
          type="date"
          value={formData.validFrom}
          onChange={(_, value) => onFormDataChange({ ...formData, validFrom: value || '' })}
          styles={{ root: { flex: 1 } }}
        />
        <TextField
          label="Valid To (Optional)"
          type="date"
          value={formData.validTo}
          onChange={(_, value) => onFormDataChange({ ...formData, validTo: value || '' })}
          styles={{ root: { flex: 1 } }}
        />
      </div>
    </BaseLinkForm>
  );
};