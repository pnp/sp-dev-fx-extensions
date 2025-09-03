import * as React from "react";
import { Add24Regular, Save24Regular, Delete24Regular, Dismiss24Regular, Edit24Regular } from "@fluentui/react-icons";
import {
  SharePointButton,
  SharePointInput,
  SharePointTextArea,
  SharePointSection
} from "../../UI/SharePointControls";
import ColorPicker from "../../UI/ColorPicker";
import AlertPreview from "../../UI/AlertPreview";
import { AlertPriority, IAlertType } from "../../Alerts/IAlerts";
import { SharePointAlertService } from "../../Services/SharePointAlertService";
import { NotificationService } from "../../Services/NotificationService";
import styles from "../AlertSettings.module.scss";
import { logger } from '../../Services/LoggerService';

export interface IAlertTypesTabProps {
  alertTypes: IAlertType[];
  setAlertTypes: React.Dispatch<React.SetStateAction<IAlertType[]>>;
  newAlertType: IAlertType;
  setNewAlertType: React.Dispatch<React.SetStateAction<IAlertType>>;
  isCreatingType: boolean;
  setIsCreatingType: React.Dispatch<React.SetStateAction<boolean>>;
  alertService: SharePointAlertService;
  onSettingsChange: (settings: any) => void;
  context?: any; // ApplicationCustomizerContext for notifications
}

const AlertTypesTab: React.FC<IAlertTypesTabProps> = ({
  alertTypes,
  setAlertTypes,
  newAlertType,
  setNewAlertType,
  isCreatingType,
  setIsCreatingType,
  alertService,
  onSettingsChange,
  context
}) => {
  const [draggedItem, setDraggedItem] = React.useState<number | null>(null);
  const [editingType, setEditingType] = React.useState<IAlertType | null>(null);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const notificationService = React.useMemo(() => 
    context ? NotificationService.getInstance(context) : null, 
    [context]
  );

  const handleCreateAlertType = React.useCallback(async () => {
    if (!newAlertType.name.trim()) {
      if (notificationService) {
        notificationService.showWarning("Please enter a name for the alert type", "Validation Error");
      } else {
        alert("Please enter a name for the alert type");
      }
      return;
    }

    if (alertTypes.some(type => type.name.toLowerCase() === newAlertType.name.toLowerCase())) {
      alert("An alert type with this name already exists");
      return;
    }

    try {
      const updatedTypes = [...alertTypes, { ...newAlertType }];
      
      // Save to SharePoint list
      await alertService.saveAlertTypes(updatedTypes);
      
      // Update local state
      setAlertTypes(updatedTypes);

      // Reset form
      setNewAlertType({
        name: "",
        iconName: "Info",
        backgroundColor: "#0078d4",
        textColor: "#ffffff",
        additionalStyles: "",
        priorityStyles: {
          [AlertPriority.Critical]: "border: 2px solid #E81123;",
          [AlertPriority.High]: "border: 1px solid #EA4300;",
          [AlertPriority.Medium]: "",
          [AlertPriority.Low]: ""
        }
      });
      setIsCreatingType(false);
    } catch (error) {
      logger.error('AlertTypesTab', 'Error creating alert type', error);
      alert('Failed to create alert type. Please try again.');
    }
  }, [newAlertType, alertTypes, setAlertTypes, alertService, setNewAlertType, setIsCreatingType]);

  const handleDeleteAlertType = React.useCallback(async (index: number) => {
    const typeToDelete = alertTypes[index];
    
    if (!confirm(`Are you sure you want to delete the alert type "${typeToDelete.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const updatedTypes = alertTypes.filter((_, i) => i !== index);
      
      // Save to SharePoint list
      await alertService.saveAlertTypes(updatedTypes);
      
      // Update local state
      setAlertTypes(updatedTypes);
    } catch (error) {
      logger.error('AlertTypesTab', 'Error deleting alert type', error);
      alert('Failed to delete alert type. Please try again.');
    }
  }, [alertTypes, setAlertTypes, alertService]);

  const handleDragStart = React.useCallback((e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = React.useCallback(() => {
    setDraggedItem(null);
  }, []);

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = React.useCallback(async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === dropIndex) return;

    const updatedTypes = [...alertTypes];
    const draggedType = updatedTypes[draggedItem];
    
    // Remove the dragged item
    updatedTypes.splice(draggedItem, 1);
    
    // Insert at the new position
    const insertIndex = draggedItem < dropIndex ? dropIndex - 1 : dropIndex;
    updatedTypes.splice(insertIndex, 0, draggedType);
    
    try {
      // Save to SharePoint list
      await alertService.saveAlertTypes(updatedTypes);
      
      // Update local state
      setAlertTypes(updatedTypes);
    } catch (error) {
      logger.error('AlertTypesTab', 'Error reordering alert types', error);
      alert('Failed to save reordered alert types. Please try again.');
    }
    
    setDraggedItem(null);
  }, [draggedItem, alertTypes, setAlertTypes, alertService]);

  const resetNewAlertType = React.useCallback(() => {
    setNewAlertType({
      name: "",
      iconName: "Info",
      backgroundColor: "#0078d4",
      textColor: "#ffffff",
      additionalStyles: "",
      priorityStyles: {
        [AlertPriority.Critical]: "border: 2px solid #E81123;",
        [AlertPriority.High]: "border: 1px solid #EA4300;",
        [AlertPriority.Medium]: "",
        [AlertPriority.Low]: ""
      }
    });
    setIsCreatingType(false);
  }, [setNewAlertType, setIsCreatingType]);

  const handleEditAlertType = React.useCallback((alertType: IAlertType) => {
    setEditingType({ ...alertType });
    setNewAlertType({ ...alertType });
    setIsEditMode(true);
    setIsCreatingType(true); // Reuse the creation form for editing
  }, [setNewAlertType, setIsCreatingType]);

  const handleUpdateAlertType = React.useCallback(async () => {
    if (!editingType || !newAlertType.name.trim()) {
      if (notificationService) {
        notificationService.showWarning("Please enter a name for the alert type", "Validation Error");
      } else {
        alert("Please enter a name for the alert type");
      }
      return;
    }

    // Check for duplicate names (excluding the current type being edited)
    if (alertTypes.some(type => 
      type.name.toLowerCase() === newAlertType.name.toLowerCase() && 
      type.name !== editingType.name
    )) {
      alert("An alert type with this name already exists");
      return;
    }

    try {
      // Update the alert type in the list
      const updatedTypes = alertTypes.map(type => 
        type.name === editingType.name ? { ...newAlertType } : type
      );
      
      setAlertTypes(updatedTypes);
      
      // Save to SharePoint
      await alertService.saveAlertTypes(updatedTypes);
      
      // Reset editing state
      setEditingType(null);
      setIsEditMode(false);
      resetNewAlertType();
      
      onSettingsChange({ alertTypes: updatedTypes });
      
      alert("Alert type updated successfully!");
    } catch (error) {
      logger.error('AlertTypesTab', 'Failed to update alert type', error);
      alert(`Failed to update alert type: ${error.message || error}`);
    }
  }, [editingType, newAlertType, alertTypes, setAlertTypes, alertService, onSettingsChange, resetNewAlertType]);

  const handleCancelEdit = React.useCallback(() => {
    setEditingType(null);
    setIsEditMode(false);
    resetNewAlertType();
  }, [resetNewAlertType]);

  return (
    <div className={styles.tabContent}>
      <div className={styles.tabHeader}>
        <div>
          <h3>Manage Alert Types</h3>
          <p>Create and customize the visual appearance of different alert categories</p>
        </div>
        <SharePointButton
          variant="primary"
          icon={<Add24Regular />}
          onClick={() => setIsCreatingType(true)}
        >
          Create New Type
        </SharePointButton>
      </div>

      {isCreatingType && (
        <SharePointSection title="Create New Alert Type">
          <div className={styles.typeFormWithPreview}>
            <div className={styles.typeFormColumn}>
              <SharePointInput
                label="Type Name"
                value={newAlertType.name}
                onChange={(value) => setNewAlertType(prev => ({ ...prev, name: value }))}
                placeholder="e.g., Maintenance, Emergency, Update"
                required
                description="A unique name for this alert type"
              />

              <div className={styles.colorRow}>
                <ColorPicker
                  label="Background Color"
                  value={newAlertType.backgroundColor}
                  onChange={(color) => setNewAlertType(prev => ({ ...prev, backgroundColor: color }))}
                  description="Main background color for alerts of this type"
                />
                <ColorPicker
                  label="Text Color"
                  value={newAlertType.textColor}
                  onChange={(color) => setNewAlertType(prev => ({ ...prev, textColor: color }))}
                  description="Text color that contrasts well with background"
                />
              </div>

              <SharePointInput
                label="Icon Name"
                value={newAlertType.iconName}
                onChange={(value) => setNewAlertType(prev => ({ ...prev, iconName: value }))}
                placeholder="Info, Warning, Error, CheckmarkCircle, etc."
                description="Fluent UI icon name (optional)"
              />

              <SharePointTextArea
                label="Custom CSS Styles"
                value={newAlertType.additionalStyles || ""}
                onChange={(value) => setNewAlertType(prev => ({ ...prev, additionalStyles: value }))}
                placeholder="Additional CSS styles (advanced)"
                rows={3}
                description="Optional custom CSS for advanced styling"
              />

              <div className={styles.formActions}>
                <SharePointButton
                  variant="primary"
                  icon={<Save24Regular />}
                  onClick={isEditMode ? handleUpdateAlertType : handleCreateAlertType}
                  disabled={!newAlertType.name.trim()}
                >
                  {isEditMode ? 'Update Type' : 'Create Type'}
                </SharePointButton>
                <SharePointButton
                  variant="secondary"
                  icon={<Dismiss24Regular />}
                  onClick={isEditMode ? handleCancelEdit : resetNewAlertType}
                >
                  Cancel
                </SharePointButton>
              </div>
            </div>

            <div className={styles.typePreviewColumn}>
              <h4>Preview</h4>
              <AlertPreview
                title="Sample Alert Title"
                description="This is how alerts with this type will appear to users. The preview updates as you change the colors and settings."
                alertType={newAlertType}
                priority={AlertPriority.Medium}
                isPinned={false}
              />
            </div>
          </div>
        </SharePointSection>
      )}

      <SharePointSection title="Existing Alert Types">
        <div className={styles.dragDropInstructions}>
          <p>💡 <strong>Tip:</strong> Drag and drop alert types to reorder them. The order here determines the display order in dropdown menus.</p>
        </div>

        <div className={styles.existingTypes}>
          {alertTypes.map((type, index) => (
            <div
              key={type.name}
              className={`${styles.alertTypeCard} ${draggedItem === index ? styles.alertCard : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className={styles.dragHandle}>
                <span className={styles.dragIcon}>⋮⋮</span>
                <span className={styles.orderNumber}>#{index + 1}</span>
              </div>

              <div className={styles.alertCardContent}>
                <h4>{type.name}</h4>
              </div>

              <div className={styles.typePreview}>
                <AlertPreview
                  title={`Sample ${type.name} Alert`}
                  description="This is a preview of how this alert type appears."
                  alertType={type}
                  priority={AlertPriority.Medium}
                  isPinned={false}
                  />
              </div>

              <div className={styles.typeActions}>
                <SharePointButton
                  variant="secondary"
                  icon={<Edit24Regular />}
                  onClick={() => handleEditAlertType(type)}
                >
                  Edit
                </SharePointButton>
                <SharePointButton
                  variant="danger"
                  icon={<Delete24Regular />}
                  onClick={() => handleDeleteAlertType(index)}
                >
                  Delete
                </SharePointButton>
              </div>
            </div>
          ))}

          {alertTypes.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎨</div>
              <h4>No Alert Types</h4>
              <p>Create your first alert type to get started with customized alert styling.</p>
              <SharePointButton
                variant="primary"
                icon={<Add24Regular />}
                onClick={() => setIsCreatingType(true)}
              >
                Create First Type
              </SharePointButton>
            </div>
          )}
        </div>
      </SharePointSection>
    </div>
  );
};

export default AlertTypesTab;