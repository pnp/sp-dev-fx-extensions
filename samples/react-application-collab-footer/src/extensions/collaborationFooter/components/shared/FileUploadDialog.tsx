import * as React from 'react';
import { useState, useCallback } from 'react';
import { BaseDialog } from './BaseDialog';
import { Icon } from '@fluentui/react/lib/Icon';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
// Simple file size formatter (replaces deleted utils)
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
import styles from './FileUploadDialog.module.scss';

export interface IFileUploadDialogProps {
  isOpen: boolean;
  onDismiss: () => void;
  onFileSelected: (file: File) => void;
  title?: string;
  acceptedTypes?: string[];
  maxFileSizeMB?: number;
  description?: string;
}

export const FileUploadDialog: React.FC<IFileUploadDialogProps> = ({
  isOpen,
  onDismiss,
  onFileSelected,
  title = 'Upload File',
  acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/gif'],
  maxFileSizeMB = 5,
  description = 'Select a file to upload'
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      const acceptedExtensions = acceptedTypes
        .map(type => type.split('/')[1])
        .join(', ');
      return `Please select a valid file type. Accepted formats: ${acceptedExtensions}`;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSizeMB) {
      return `File size exceeds ${maxFileSizeMB}MB limit. Current size: ${fileSizeMB.toFixed(2)}MB`;
    }

    return null;
  }, [acceptedTypes, maxFileSizeMB]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
      } else {
        setError(null);
        setSelectedFile(file);
      }
    }
  }, [validateFile]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
      } else {
        setError(null);
        setSelectedFile(file);
      }
    }
  }, [validateFile]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  const handleUpload = useCallback(() => {
    if (selectedFile) {
      onFileSelected(selectedFile);
      onDismiss();
    }
  }, [selectedFile, onFileSelected, onDismiss]);

  const handleClose = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    setDragOver(false);
    onDismiss();
  }, [onDismiss]);


  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      subText={description}
      maxWidth={500}
      error={error}
      primaryButton={{
        text: "Upload",
        onClick: handleUpload,
        disabled: !selectedFile || !!error,
        iconProps: { iconName: 'Upload' }
      }}
    >
      <Stack tokens={{ childrenGap: 16 }}>
        <div
          className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''} ${selectedFile ? styles.fileSelected : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            id="fileInput"
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileChange}
            className={styles.hiddenFileInput}
          />
          
          <div className={styles.dropZoneContent}>
            {selectedFile ? (
              <>
                <Icon iconName="CheckMark" className={styles.successIcon} />
                <Text variant="mediumPlus" className={styles.fileName}>
                  {selectedFile.name}
                </Text>
                <Text variant="small" className={styles.fileSize}>
                  {formatFileSize(selectedFile.size)}
                </Text>
              </>
            ) : (
              <>
                <Icon iconName="Upload" className={styles.uploadIcon} />
                <Text variant="mediumPlus" className={styles.dropZoneText}>
                  {dragOver ? 'Drop file here' : 'Drag & drop a file here'}
                </Text>
                <Text variant="small" className={styles.orText}>
                  or
                </Text>
                <label htmlFor="fileInput" className={styles.browseButton}>
                  <Icon iconName="FolderOpen" />
                  Browse Files
                </label>
              </>
            )}
          </div>
        </div>

        <div className={styles.fileInfo}>
          <Text variant="small" className={styles.acceptedFormats}>
            <strong>Accepted formats:</strong> {acceptedTypes.map(type => type.split('/')[1]).join(', ')}
          </Text>
          <Text variant="small" className={styles.maxSize}>
            <strong>Maximum size:</strong> {maxFileSizeMB}MB
          </Text>
        </div>
      </Stack>
    </BaseDialog>
  );
};