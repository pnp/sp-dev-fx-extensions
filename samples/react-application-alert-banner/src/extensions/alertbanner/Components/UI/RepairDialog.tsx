import * as React from 'react';
import {
  Dialog,
  DialogType,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  ProgressIndicator,
  MessageBar,
  MessageBarType,
  List,
  Text,
  Icon,
  Stack,
  Separator
} from '@fluentui/react';
import { IRepairResult } from '../Services/SharePointAlertService';
import { SharePointAlertService } from '../Services/SharePointAlertService';
import styles from './RepairDialog.module.scss';

export interface IRepairDialogProps {
  isOpen: boolean;
  onDismiss: () => void;
  onRepairComplete: (result: IRepairResult) => void;
  alertService: SharePointAlertService;
}

interface IRepairProgress {
  message: string;
  progress: number;
}

const RepairDialog: React.FC<IRepairDialogProps> = ({
  isOpen,
  onDismiss,
  onRepairComplete,
  alertService
}) => {
  const [isRepairing, setIsRepairing] = React.useState(false);
  const [repairProgress, setRepairProgress] = React.useState<IRepairProgress>({ message: '', progress: 0 });
  const [repairResult, setRepairResult] = React.useState<IRepairResult | null>(null);
  const [showConfirmation, setShowConfirmation] = React.useState(true);

  const handleStartRepair = React.useCallback(async () => {
    setIsRepairing(true);
    setShowConfirmation(false);
    setRepairResult(null);

    try {
      // Get the current site ID from context
      const siteId = alertService.getCurrentSiteId();
      
      const result = await alertService.repairAlertsList(
        siteId,
        (message: string, progress: number) => {
          setRepairProgress({ message, progress });
        }
      );

      setRepairResult(result);
      onRepairComplete(result);
    } catch (error) {
      const errorResult: IRepairResult = {
        success: false,
        message: `Repair failed: ${error.message}`,
        details: {
          columnsRemoved: [],
          columnsAdded: [],
          columnsUpdated: [],
          errors: [error.message],
          warnings: []
        }
      };
      setRepairResult(errorResult);
      onRepairComplete(errorResult);
    } finally {
      setIsRepairing(false);
    }
  }, [alertService, onRepairComplete]);

  const handleDismiss = React.useCallback(() => {
    if (!isRepairing) {
      setShowConfirmation(true);
      setRepairProgress({ message: '', progress: 0 });
      setRepairResult(null);
      onDismiss();
    }
  }, [isRepairing, onDismiss]);

  const renderConfirmationContent = () => (
    <Stack tokens={{ childrenGap: 20 }}>
      <MessageBar messageBarType={MessageBarType.warning}>
        <strong>This action will modify your SharePoint list structure.</strong>
      </MessageBar>
      
      <div className={styles.confirmationContent}>
        <Text variant="medium">
          The repair process will:
        </Text>
        
        <ul className={styles.repairActionsList}>
          <li>
            <Icon iconName="Delete" className={styles.removeIcon} />
            <Text>Remove outdated columns that are no longer needed</Text>
          </li>
          <li>
            <Icon iconName="Add" className={styles.addIcon} />
            <Text>Add missing columns with current definitions</Text>
          </li>
          <li>
            <Icon iconName="Refresh" className={styles.updateIcon} />
            <Text>Update existing columns to match the latest schema</Text>
          </li>
          <li>
            <Icon iconName="Shield" className={styles.protectIcon} />
            <Text>Preserve all existing data and language-specific columns</Text>
          </li>
        </ul>

        <MessageBar messageBarType={MessageBarType.info}>
          <strong>Safe Process:</strong> This repair is designed to be non-destructive. 
          Your existing alert data will be preserved, and language-specific columns will be kept intact.
        </MessageBar>
      </div>
    </Stack>
  );

  const renderProgressContent = () => (
    <Stack tokens={{ childrenGap: 15 }}>
      <Text variant="mediumPlus">Repairing Alerts List...</Text>
      
      <ProgressIndicator
        percentComplete={repairProgress.progress / 100}
        description={repairProgress.message}
        className={styles.progressIndicator}
      />
      
      <Text variant="small" className={styles.progressText}>
        Please wait while we update your list structure. This may take a few minutes.
      </Text>
    </Stack>
  );

  const renderResultContent = () => {
    if (!repairResult) return null;

    const { success, message, details } = repairResult;
    
    return (
      <Stack tokens={{ childrenGap: 20 }}>
        <MessageBar 
          messageBarType={success ? MessageBarType.success : MessageBarType.error}
          className={styles.resultMessage}
        >
          <strong>{success ? 'Repair Completed!' : 'Repair Failed'}</strong>
          <br />
          {message}
        </MessageBar>

        {details.columnsRemoved.length > 0 && (
          <div className={styles.resultSection}>
            <Text variant="medium" className={styles.sectionTitle}>
              <Icon iconName="Delete" className={styles.removeIcon} />
              Removed Columns ({details.columnsRemoved.length})
            </Text>
            <List
              items={details.columnsRemoved}
              onRenderCell={(item) => (
                <div className={styles.listItem}>
                  <Icon iconName="CheckMark" className={styles.successIcon} />
                  <Text variant="small">{item}</Text>
                </div>
              )}
            />
          </div>
        )}

        {details.columnsAdded.length > 0 && (
          <div className={styles.resultSection}>
            <Text variant="medium" className={styles.sectionTitle}>
              <Icon iconName="Add" className={styles.addIcon} />
              Added/Updated Columns ({details.columnsAdded.length})
            </Text>
            <List
              items={details.columnsAdded}
              onRenderCell={(item) => (
                <div className={styles.listItem}>
                  <Icon iconName="CheckMark" className={styles.successIcon} />
                  <Text variant="small">{item}</Text>
                </div>
              )}
            />
          </div>
        )}

        {details.warnings.length > 0 && (
          <div className={styles.resultSection}>
            <Text variant="medium" className={styles.sectionTitle}>
              <Icon iconName="Warning" className={styles.warningIcon} />
              Warnings ({details.warnings.length})
            </Text>
            <List
              items={details.warnings}
              onRenderCell={(item) => (
                <div className={styles.listItem}>
                  <Icon iconName="Warning" className={styles.warningIcon} />
                  <Text variant="small">{item}</Text>
                </div>
              )}
            />
          </div>
        )}

        {details.errors.length > 0 && (
          <div className={styles.resultSection}>
            <Text variant="medium" className={styles.sectionTitle}>
              <Icon iconName="Error" className={styles.errorIcon} />
              Errors ({details.errors.length})
            </Text>
            <List
              items={details.errors}
              onRenderCell={(item) => (
                <div className={styles.listItem}>
                  <Icon iconName="Error" className={styles.errorIcon} />
                  <Text variant="small">{item}</Text>
                </div>
              )}
            />
          </div>
        )}
      </Stack>
    );
  };

  const getDialogTitle = () => {
    if (repairResult) {
      return repairResult.success ? 'Repair Completed Successfully' : 'Repair Completed with Issues';
    }
    if (isRepairing) {
      return 'Repairing Alerts List';
    }
    return 'Repair Alerts List';
  };

  return (
    <Dialog
      hidden={!isOpen}
      onDismiss={handleDismiss}
      dialogContentProps={{
        type: DialogType.largeHeader,
        title: getDialogTitle(),
        subText: !showConfirmation && !repairResult ? 'Please wait...' : undefined
      }}
      modalProps={{
        isBlocking: isRepairing,
        dragOptions: isRepairing ? undefined : {
          moveMenuItemText: 'Move',
          closeMenuItemText: 'Close',
          menu: undefined
        }
      }}
      minWidth={600}
      maxWidth={800}
      className={styles.repairDialog}
    >
      <div className={styles.dialogContent}>
        {showConfirmation && renderConfirmationContent()}
        {isRepairing && renderProgressContent()}
        {repairResult && renderResultContent()}
      </div>

      <DialogFooter>
        {showConfirmation && (
          <>
            <PrimaryButton
              onClick={handleStartRepair}
              text="Start Repair"
              iconProps={{ iconName: 'Wrench' }}
              className={styles.primaryButton}
            />
            <DefaultButton
              onClick={handleDismiss}
              text="Cancel"
            />
          </>
        )}
        
        {isRepairing && (
          <DefaultButton
            disabled
            text="Repairing..."
            iconProps={{ iconName: 'ProgressLoopInner' }}
          />
        )}
        
        {repairResult && (
          <PrimaryButton
            onClick={handleDismiss}
            text="Close"
            iconProps={{ iconName: 'CheckMark' }}
          />
        )}
      </DialogFooter>
    </Dialog>
  );
};

export default RepairDialog;