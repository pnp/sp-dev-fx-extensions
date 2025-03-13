import * as React from "react";
import { Panel, PanelType, Icon, Stack, Text, PrimaryButton, DefaultButton, Spinner, SpinnerSize } from "@fluentui/react";
import { TemplateFile } from "../../../hooks/useTemplateFiles";
import styles from './CompanyTemplates.module.scss'; 
import { getFileTypeIconProps } from '@fluentui/react-file-type-icons';

export interface ITemplatePreviewProps {
  file: TemplateFile;
  isOpen: boolean;
  onDismiss: () => void;
}

export const TemplatePreview: React.FC<ITemplatePreviewProps> = (props) => {
  const { file, isOpen, onDismiss } = props;
  const [previewContent, setPreviewContent] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    if (isOpen && file) {
      setLoading(true);
      setError(null);
      
      try {
        const fileExtension = file.fileType.toLowerCase();
        let preview = '<p>Preview is not available for this file type.</p>';
        
        if (['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(fileExtension)) {
          preview = `<img src="${file.serverRelativeUrl || file.fileRef}" alt="Preview" style="max-width:100%; max-height:400px;" />`;
        } else if (['pdf'].includes(fileExtension)) {
          preview = `<embed src="${file.serverRelativeUrl || file.fileRef}" type="application/pdf" width="100%" height="400px" />`;
        } else if (['docx', 'pptx', 'xlsx'].includes(fileExtension)) {
          preview = `<div style="text-align:center; padding: 20px;">
                      <p>Preview for Office documents requires Office Web Viewer integration.</p>
                      <p>Please download the file to view its contents.</p>
                    </div>`;
        }
        
        setPreviewContent(preview);
        setLoading(false);
      } catch (err: any) {
        console.error("Error loading preview:", err);
        setError("Could not load preview for this file type.");
        setLoading(false);
      }
    }
  }, [file, isOpen]);

  const formatDate = (dateString: string | Date): string => {
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!file) return null;

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      headerText="Template Preview"
      type={PanelType.medium}
      closeButtonAriaLabel="Close"
      isLightDismiss={true}
    >
      <div className={styles.previewPanel}>
        <div className={styles.previewHeader}>
          <Icon {...getFileTypeIconProps({ extension: file.fileType, size: 32, imageFileType: 'png' })} />
          <span className={styles.previewTitle}>{file.fileLeafRef}</span>
        </div>
        
        <div className={styles.previewContent}>
          {loading && (
            <Spinner size={SpinnerSize.large} label="Loading preview..." />
          )}
          
          {!loading && error && (
            <div>
              <Icon iconName="Error" style={{ color: 'red', marginRight: '8px' }} />
              <Text>{error}</Text>
              <Text block>Preview is not available for this file type.</Text>
            </div>
          )}
          
          {!loading && !error && (
            previewContent ? (
              <div dangerouslySetInnerHTML={{ __html: previewContent }} />
            ) : (
              <Text>No preview available for this file type.</Text>
            )
          )}
        </div>
        
        <div className={styles.previewMetadata}>
          <h3>File Information</h3>
          
          <div className={styles.metadataItem}>
            <span className={styles.metadataLabel}>File Path:</span>
            <span>{Array.isArray(file.filePath) ? file.filePath.join('/') : file.filePath.toString()}</span>
          </div>
          
          <div className={styles.metadataItem}>
            <span className={styles.metadataLabel}>File Size:</span>
            <span>{formatFileSize(file.size || 0)}</span>
          </div>
          
          <div className={styles.metadataItem}>
            <span className={styles.metadataLabel}>Version:</span>
            <span>{file.version || 'N/A'}</span>
          </div>
          
          <div className={styles.metadataItem}>
            <span className={styles.metadataLabel}>Created:</span>
            <span>{file.created ? formatDate(file.created) : 'N/A'}</span>
          </div>
          
          <div className={styles.metadataItem}>
            <span className={styles.metadataLabel}>Modified:</span>
            <span>{file.modified ? formatDate(file.modified as Date) : 'N/A'}</span>
          </div>
          
          <div className={styles.metadataItem}>
            <span className={styles.metadataLabel}>Categories:</span>
            <Stack horizontal tokens={{ childrenGap: 5 }}>
              {file.categories && file.categories.map(category => (
                <Text key={category} className={styles.category}>{category}</Text>
              ))}
              {(!file.categories || file.categories.length === 0) && <span>None</span>}
            </Stack>
          </div>
        </div>
        
        <Stack horizontal tokens={{ childrenGap: 10 }} style={{ marginTop: '20px' }}>
          <PrimaryButton 
            text="Download" 
            iconProps={{ iconName: 'Download' }}
            onClick={() => window.open(file.serverRelativeUrl || file.fileRef, '_blank')}
          />
          <DefaultButton 
            text="Close" 
            onClick={onDismiss} 
          />
        </Stack>
      </div>
    </Panel>
  );
};