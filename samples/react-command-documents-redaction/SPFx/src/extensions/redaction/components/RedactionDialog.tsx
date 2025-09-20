import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Stack,
  Text,
  Separator,
  MessageBar,
  MessageBarType,
  ChoiceGroup,
  IChoiceGroupOption,
  Checkbox,
  Dropdown,
  IDropdownOption,
  ProgressIndicator,
  List,
  Icon,
  TooltipHost,
  PrimaryButton,
  DefaultButton,
} from "@fluentui/react";
import { ExtensionContext } from "@microsoft/sp-extension-base";
import {
  DocumentInfo,
  RedactionOptions,
  MaskType,
  PiiEntityCategory,
  PII_CATEGORIES_DISPLAY,
  MASK_CHARACTERS,
  RedactionJobStatus,
} from "../../../models/RedactionModels";
import {
  RedactionService,
  IRedactionServiceConfig,
} from "../../../services/RedactionService";
import { FileValidationService } from "../../../services/FileValidationService";

export interface IRedactionDialogProps {
  context: ExtensionContext;
  documents: DocumentInfo[];
  config: IRedactionServiceConfig;
  isOpen: boolean;
  onClose: () => void;
}

interface IRedactionDialogState {
  step: "configure" | "processing" | "completed";
  maskType: MaskType;
  selectedCategories: PiiEntityCategory[];
  includeAllCategories: boolean;
  maskCharacter: string;
  isProcessing: boolean;
  jobStatus?: RedactionJobStatus;
  error?: string;
  validationErrors: string[];
}

export const RedactionDialog: React.FC<IRedactionDialogProps> = ({
  context,
  documents,
  config,
  isOpen,
  onClose,
}) => {
  const [state, setState] = useState<IRedactionDialogState>({
    step: "configure",
    maskType: MaskType.EntityMask,
    selectedCategories: [],
    includeAllCategories: true,
    maskCharacter: "*",
    isProcessing: false,
    validationErrors: [],
  });

  const redactionService = new RedactionService(context, config);

  const maskTypeOptions: IChoiceGroupOption[] = [
    {
      key: MaskType.EntityMask,
      text: "Entity Mask",
    },
    {
      key: MaskType.CharacterMask,
      text: "Character Mask",
    },
  ];

  const maskCharacterOptions: IDropdownOption[] = MASK_CHARACTERS.map(
    (char) => ({
      key: char,
      text: char,
    })
  );

  // Build options in ES5-compatible way (no Object.entries)
  const categoryKeys: string[] = [];
  for (const k in PII_CATEGORIES_DISPLAY) {
    if (Object.prototype.hasOwnProperty.call(PII_CATEGORIES_DISPLAY, k)) {
      categoryKeys.push(k);
    }
  }

  const handleMaskTypeChange = useCallback((_, option) => {
    if (option) {
      setState((prev) => ({ ...prev, maskType: option.key as MaskType }));
    }
  }, []);

  const handleMaskCharacterChange = useCallback((_, option) => {
    if (option) {
      setState((prev) => ({ ...prev, maskCharacter: option.key as string }));
    }
  }, []);

  const handleIncludeAllCategoriesChange = useCallback((_, checked) => {
    setState((prev) => ({
      ...prev,
      includeAllCategories: !!checked,
      selectedCategories: checked ? [] : prev.selectedCategories,
    }));
  }, []);

  const handleCategoryChange = useCallback(
    (key: string) => (_: any, checked: boolean) => {
      setState((prev) => {
        const exists =
          prev.selectedCategories.indexOf(key as PiiEntityCategory) > -1;
        let next: PiiEntityCategory[];
        if (checked && !exists) {
          next = prev.selectedCategories.concat([key as PiiEntityCategory]);
        } else if (!checked && exists) {
          next = prev.selectedCategories.filter(
            (cat) => cat !== (key as PiiEntityCategory)
          );
        } else {
          next = prev.selectedCategories;
        }
        return { ...prev, selectedCategories: next };
      });
    },
    []
  );

  const validateConfiguration = useCallback((): string[] => {
    const errors: string[] = [];

    if (
      state.maskType === MaskType.EntityMask &&
      !state.includeAllCategories &&
      state.selectedCategories.length === 0
    ) {
      errors.push(
        'Please select at least one PII category or choose "Include all categories"'
      );
    }

    if (state.maskType === MaskType.CharacterMask && !state.maskCharacter) {
      errors.push("Please select a mask character");
    }

    return errors;
  }, [
    state.maskType,
    state.includeAllCategories,
    state.selectedCategories,
    state.maskCharacter,
  ]);

  useEffect(() => {
    const errors = validateConfiguration();
    setState((prev) => ({ ...prev, validationErrors: errors }));
  }, [validateConfiguration]);

  const handleStartRedaction = async (): Promise<void> => {
    const errors = validateConfiguration();
    if (errors.length > 0) {
      setState((prev) => ({ ...prev, validationErrors: errors }));
      return;
    }

    console.log("Starting redaction process...");
    setState((prev) => ({
      ...prev,
      isProcessing: true,
      step: "processing",
      error: undefined,
      jobStatus: undefined, // Reset job status
    }));

    const options: RedactionOptions = {
      maskType: state.maskType === MaskType.EntityMask ? 0 : 1,
      ...(state.maskType === MaskType.CharacterMask && {
        maskCharacter: state.maskCharacter,
      }),
      ...(state.maskType === MaskType.EntityMask && {
        includeAllCategories: state.includeAllCategories,
        selectedCategories: state.includeAllCategories
          ? undefined
          : state.selectedCategories,
      }),
    };

    try {
      const result = await redactionService.startRedactionJob(
        documents,
        options
      );

      if (!result.success) {
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          step: "configure",
          error: result.message,
        }));
        return;
      }

      // Start polling for job status with more frequent updates initially
      console.log("Starting job status polling for job:", result.jobId);

      try {
        await redactionService.pollJobStatus(
          result.jobId,
          (status) => {
            setState((prev) => ({
              ...prev,
              jobStatus: status,
              // Keep processing state true until job is completed or failed
              isProcessing:
                status.status === "processing" || status.status === "pending",
            }));
          },
          1000 // Poll every 1 second for more responsive updates
        );

        console.log("Job polling completed successfully");
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          step: "completed",
        }));
      } catch (pollingError) {
        console.error("Error during job status polling:", pollingError);
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          step: "configure",
          error: `Polling failed: ${
            pollingError instanceof Error
              ? pollingError.message
              : "Unknown error"
          }`,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isProcessing: false,
        step: "configure",
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      }));
    }
  };

  const renderDocumentList = (): React.ReactElement => (
    <Stack tokens={{ childrenGap: 8 }}>
      <Text variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>
        Selected Documents ({documents.length})
      </Text>
      <div className="redaction-doc-list">
        <List
          items={documents}
          onRenderCell={(item?: DocumentInfo): JSX.Element | null => {
            if (!item) {
              return null;
            }
            return (
              <Stack
                horizontal
                verticalAlign="center"
                tokens={{ childrenGap: 8 }}
                styles={{ root: { padding: 8 } }}
              >
                <Icon iconName="Page" styles={{ root: { color: "#0078d4" } }} />
                <Stack grow>
                  <Text>{item.name}</Text>
                  <Text variant="small" styles={{ root: { color: "#666" } }}>
                    {(item.size / 1024).toFixed(1)} KB
                  </Text>
                </Stack>
                <TooltipHost content={item.fileType.toUpperCase()}>
                  <Text
                    variant="small"
                    styles={{
                      root: { color: "#666", fontFamily: "monospace" },
                    }}
                  >
                    {item.fileType}
                  </Text>
                </TooltipHost>
              </Stack>
            );
          }}
        />
      </div>
      <Text variant="small" styles={{ root: { color: "#666" } }}>
        {FileValidationService.getValidationSummary(documents)}
      </Text>
    </Stack>
  );

  const renderConfigurationStep = (): React.ReactElement => (
    <Stack tokens={{ childrenGap: 16 }}>
      {renderDocumentList()}

      <Separator />

      <Stack tokens={{ childrenGap: 12 }}>
        <Text variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>
          Redaction Settings
        </Text>

        <ChoiceGroup
          label="Mask Type"
          options={maskTypeOptions}
          selectedKey={state.maskType}
          onChange={handleMaskTypeChange}
          required
        />

        {state.maskType === MaskType.CharacterMask && (
          <Dropdown
            label="Mask Character"
            selectedKey={state.maskCharacter}
            options={maskCharacterOptions}
            onChange={handleMaskCharacterChange}
            required
            styles={{ root: { maxWidth: 200 } }}
          />
        )}

        <Stack tokens={{ childrenGap: 8 }}>
          <Checkbox
            label="Include all PII categories"
            checked={state.includeAllCategories}
            onChange={handleIncludeAllCategoriesChange}
          />

          {!state.includeAllCategories && (
            <Stack tokens={{ childrenGap: 4 }}>
              <Text variant="small" styles={{ root: { fontWeight: 600 } }}>
                Select PII Categories to Redact:
              </Text>
              <Stack
                tokens={{ childrenGap: 8 }}
                styles={{
                  root: {
                    maxHeight: 300,
                    overflowY: "auto",
                    border: "1px solid #edebe9",
                    padding: 12,
                    borderRadius: 4,
                  },
                }}
              >
                {categoryKeys.map((key) => (
                  <Checkbox
                    key={key}
                    label={
                      (PII_CATEGORIES_DISPLAY as Record<string, string>)[key]
                    }
                    checked={
                      state.selectedCategories.indexOf(
                        key as PiiEntityCategory
                      ) > -1
                    }
                    onChange={handleCategoryChange(key)}
                    styles={{
                      root: { marginBottom: 4 },
                      label: { fontSize: 14 },
                    }}
                  />
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>
      </Stack>

      {state.validationErrors.length > 0 && (
        <MessageBar
          messageBarType={MessageBarType.error}
          styles={{
            root: { marginTop: 16 },
            content: { padding: 12 },
          }}
        >
          <Stack tokens={{ childrenGap: 4 }}>
            {state.validationErrors.map((error, index) => (
              <Text
                key={index}
                variant="small"
                styles={{ root: { color: "#a4262c" } }}
              >
                {error}
              </Text>
            ))}
          </Stack>
        </MessageBar>
      )}

      {state.error && (
        <MessageBar
          messageBarType={MessageBarType.error}
          styles={{
            root: { marginTop: 16 },
            content: { padding: 12 },
          }}
        >
          <Text variant="small">{state.error}</Text>
        </MessageBar>
      )}
    </Stack>
  );

  const renderProcessingStep = (): React.ReactElement => {
    // Calculate progress - handle both percentage (0-100) and decimal (0-1) formats
    const getProgressValue = (): number | undefined => {
      console.log("Job status:", state.jobStatus);

      if (!state.jobStatus) {
        console.log("No job status available yet");
        return undefined; // Will show indeterminate progress
      }

      if (
        state.jobStatus.progress === undefined ||
        state.jobStatus.progress === null
      ) {
        console.log("Progress value is undefined/null");
        return undefined; // Will show indeterminate progress
      }

      const progress = state.jobStatus.progress;
      console.log("Raw progress value:", progress);

      // If progress is greater than 1, assume it's a percentage (0-100)
      // If progress is between 0-1, assume it's already in decimal format
      const normalizedProgress = progress > 1 ? progress / 100 : progress;
      console.log("Normalized progress:", normalizedProgress);

      return normalizedProgress;
    };

    const progressValue = getProgressValue();
    console.log("Final progress value for ProgressIndicator:", progressValue);

    return (
      <Stack tokens={{ childrenGap: 16 }}>
        <Text variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>
          Processing Documents...
        </Text>

        <Stack tokens={{ childrenGap: 8 }}>
          <ProgressIndicator
            percentComplete={progressValue}
            description={
              state.jobStatus?.message || "Initializing redaction process..."
            }
            styles={{
              root: { marginBottom: 8 },
            }}
          />

          {/* Debug information - remove in production */}
          <Text
            variant="small"
            styles={{
              root: {
                color: "#999",
                fontSize: "11px",
                fontFamily: "monospace",
              },
            }}
          ></Text>
        </Stack>

        {state.jobStatus ? (
          <Stack tokens={{ childrenGap: 8 }}>
            <Text variant="small">Status: {state.jobStatus.status}</Text>
            {typeof progressValue === "number" ? (
              <Text variant="small">
                Progress: {Math.round(progressValue * 100)}%
              </Text>
            ) : (
              <Text variant="small" styles={{ root: { color: "#666" } }}>
                Progress: Indeterminate
              </Text>
            )}
            {state.jobStatus.completedDocuments.length > 0 && (
              <Text variant="small">
                Completed: {state.jobStatus.completedDocuments.length} documents
              </Text>
            )}
            {state.jobStatus.failedDocuments.length > 0 && (
              <MessageBar messageBarType={MessageBarType.warning}>
                Failed to process {state.jobStatus.failedDocuments.length}{" "}
                documents
              </MessageBar>
            )}
          </Stack>
        ) : (
          <Stack tokens={{ childrenGap: 4 }}>
            <Text
              variant="small"
              styles={{ root: { color: "#666", fontStyle: "italic" } }}
            >
              Starting redaction job...
            </Text>
            <Text
              variant="small"
              styles={{ root: { color: "#999", fontSize: "12px" } }}
            >
              Waiting for server response...
            </Text>
          </Stack>
        )}
      </Stack>
    );
  };

  const renderCompletedStep = (): React.ReactElement => (
    <Stack tokens={{ childrenGap: 16 }}>
      <MessageBar messageBarType={MessageBarType.success}>
        Redaction completed successfully!
      </MessageBar>

      {state.jobStatus && (
        <Stack tokens={{ childrenGap: 8 }}>
          <Text variant="mediumPlus">Summary:</Text>
          <Text>
            • {state.jobStatus.completedDocuments.length} documents processed
            successfully
          </Text>
          {state.jobStatus.failedDocuments.length > 0 && (
            <Text>
              • {state.jobStatus.failedDocuments.length} documents failed to
              process
            </Text>
          )}
          <Text variant="small" styles={{ root: { color: "#666" } }}>
            Redacted documents have been saved to the document library with
            "[REDACTED]_" suffix.
          </Text>
        </Stack>
      )}
    </Stack>
  );

  const getDialogContent = (): React.ReactElement => {
    switch (state.step) {
      case "configure":
        return renderConfigurationStep();
      case "processing":
        return renderProcessingStep();
      case "completed":
        return renderCompletedStep();
      default:
        return renderConfigurationStep();
    }
  };

  const getFooterButtons = (): React.ReactElement => {
    if (state.step === "processing") {
      return (
        <DefaultButton
          text="Cancel"
          onClick={onClose}
          disabled={state.isProcessing}
        />
      );
    }

    if (state.step === "completed") {
      return <PrimaryButton text="Close" onClick={onClose} />;
    }

    return (
      <Stack horizontal tokens={{ childrenGap: 8 }}>
        <PrimaryButton
          text="Start Redaction"
          onClick={handleStartRedaction}
          disabled={state.validationErrors.length > 0 || state.isProcessing}
        />
        <DefaultButton text="Cancel" onClick={onClose} />
      </Stack>
    );
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={onClose}
      isBlocking={true}
      isDarkOverlay={true}
      styles={{
        main: {
          minWidth: 600,
          maxWidth: 800,
          padding: 24,
        },
      }}
    >
      <Stack tokens={{ childrenGap: 16 }}>
        <Stack
          horizontal
          horizontalAlign="space-between"
          verticalAlign="center"
        >
          <Stack>
            <Text variant="xLarge" styles={{ root: { fontWeight: 600 } }}>
              Redact Personally Identifiable Information
            </Text>
            <Text variant="medium" styles={{ root: { color: "#666" } }}>
              Configure redaction settings for selected documents
            </Text>
          </Stack>
        </Stack>

        {getDialogContent()}

        <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 8 }}>
          {getFooterButtons()}
        </Stack>
      </Stack>
    </Modal>
  );
};
