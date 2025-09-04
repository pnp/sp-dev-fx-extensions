import * as React from 'react';
import { useState } from 'react';
import { Modal } from '@fluentui/react/lib/Modal';
import { DefaultButton, PrimaryButton, IconButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { Icon } from '@fluentui/react/lib/Icon';
import { IconService } from '../../services/IconService';
import { FileUploadDialog } from './FileUploadDialog';
import styles from './IconGallery.module.scss';

export interface IIconGalleryProps {
  isOpen: boolean;
  selectedIcon: string;
  onIconSelect: (iconName: string) => void;
  onCustomIconUpload: (file: File) => void;
  onClose: () => void;
}

export const IconGallery: React.FC<IIconGalleryProps> = ({
  isOpen,
  selectedIcon,
  onIconSelect,
  onCustomIconUpload,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Basic');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFileUpload, setShowFileUpload] = useState<boolean>(false);
  const [currentSelectedIcon, setCurrentSelectedIcon] = useState<string>(selectedIcon || '');
  const categories = IconService.getCategories();

  // Update local state when prop changes
  React.useEffect(() => {
    setCurrentSelectedIcon(selectedIcon || '');
  }, [selectedIcon]);

  const filteredIcons = IconService.filterIcons(
    selectedCategory === 'All' ? undefined : selectedCategory,
    searchQuery || undefined
  );

  const handleCustomIconUpload = (file: File) => {
    onCustomIconUpload(file);
    setShowFileUpload(false);
    onClose();
  };

  const handleConfirmSelection = () => {
    if (currentSelectedIcon) {
      onIconSelect(currentSelectedIcon);
      onClose();
    }
  };

  const handleUploadClick = () => {
    setShowFileUpload(true);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onDismiss={onClose}
        isBlocking={true}
        containerClassName={styles.iconGalleryModal}
        styles={{
          main: { 
            zIndex: 11000,
            position: 'relative'
          },
          root: {
            zIndex: 11000
          },
          scrollableContent: {
            zIndex: 11000
          }
        }}
        layerProps={{
          styles: {
            root: {
              zIndex: 11000
            }
          }
        }}
      >
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          width: '80vw',
          maxWidth: '800px',
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>Select Icon</h3>
            <IconButton iconProps={{ iconName: 'Cancel' }} onClick={onClose} />
          </div>
          
          {/* Search and Upload */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <TextField
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(_, value) => setSearchQuery(value || '')}
              iconProps={{ iconName: 'Search' }}
              styles={{ root: { flex: 1 } }}
            />
            <DefaultButton
              text="Upload Image"
              iconProps={{ iconName: 'Upload' }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleUploadClick();
              }}
              styles={{
                root: {
                  backgroundColor: '#0078d4',
                  color: 'white',
                  border: 'none'
                },
                rootHovered: {
                  backgroundColor: '#106ebe',
                  color: 'white'
                }
              }}
            />
          </div>
          
          {/* Categories */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {['All', ...categories].map(category => (
              <DefaultButton
                key={category}
                text={category}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setSelectedCategory(category);
                }}
                primary={selectedCategory === category}
                styles={{
                  root: {
                    minWidth: 'auto',
                    padding: '4px 12px',
                    fontSize: '12px'
                  }
                }}
              />
            ))}
          </div>
          
          {/* Icon Grid */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: '8px',
            padding: '8px'
          }}>
            {filteredIcons.map(icon => (
              <div
                key={icon.name}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentSelectedIcon(icon.name);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '12px 8px',
                  border: currentSelectedIcon === icon.name ? '2px solid #0078d4' : '1px solid #e1e1e1',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: currentSelectedIcon === icon.name ? '#f3f9ff' : 'white',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (currentSelectedIcon !== icon.name) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#f8f8f8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentSelectedIcon !== icon.name) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'white';
                  }
                }}
              >
                <Icon
                  iconName={icon.name}
                  style={{
                    fontSize: '24px',
                    color: currentSelectedIcon === icon.name ? '#0078d4' : '#333',
                    marginBottom: '4px'
                  }}
                />
                <span style={{
                  fontSize: '10px',
                  textAlign: 'center',
                  color: '#666',
                  wordBreak: 'break-word'
                }}>
                  {icon.name}
                </span>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <DefaultButton 
              text="Cancel" 
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onClose();
              }} 
            />
            <PrimaryButton
              text="Select"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleConfirmSelection();
              }}
              disabled={!currentSelectedIcon}
            />
          </div>
        </div>
      </Modal>

      <FileUploadDialog
        isOpen={showFileUpload}
        onDismiss={() => setShowFileUpload(false)}
        onFileSelected={handleCustomIconUpload}
        title="Upload Custom Icon"
        description="Select an image file to use as a custom icon"
        acceptedTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/gif']}
        maxFileSizeMB={2}
      />
    </>
  );
};
