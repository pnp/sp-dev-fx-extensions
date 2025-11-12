import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Stack,
  Text,
  Separator,
  MessageBar,
  MessageBarType,
  Checkbox,
  ProgressIndicator,
  List,
  Icon,
  TooltipHost,
  PrimaryButton,
  DefaultButton,
  Dropdown,
  IDropdownOption,
} from "@fluentui/react";
import { ExtensionContext } from "@microsoft/sp-extension-base";
import {
  DocumentInfo,
  TranslationOptions,
  SupportedLanguage,
  LANGUAGE_DISPLAY_NAMES,
  TranslationJobStatus,
  TranslatedDocument,
} from "../../../models/TranslationModels";
import {
  TranslationService,
  ITranslationServiceConfig,
} from "../../../services/TranslationService";
import { FileValidationService } from "../../../services/FileValidationService";

export interface ITranslationDialogProps {
  context: ExtensionContext;
  documents: DocumentInfo[];
  config: ITranslationServiceConfig;
  isOpen: boolean;
  onClose: () => void;
}

interface ITranslationDialogState {
  step: "configure" | "processing" | "completed";
  sourceLanguage?: string; // Optional for auto-detect
  selectedTargetLanguages: string[];
  autoDetectSource: boolean;
  isProcessing: boolean;
  jobStatus?: TranslationJobStatus;
  error?: string;
  validationErrors: string[];
}

export const TranslationDialog: React.FC<ITranslationDialogProps> = ({
  context,
  documents,
  config,
  isOpen,
  onClose,
}) => {
  const [state, setState] = useState<ITranslationDialogState>({
    step: "configure",
    selectedTargetLanguages: [],
    autoDetectSource: true,
    isProcessing: false,
    validationErrors: [],
  });

  const translationService = new TranslationService(context, config);

  // Build language options
  const languageOptions: IDropdownOption[] = [];
  for (const key in SupportedLanguage) {
    if (Object.prototype.hasOwnProperty.call(SupportedLanguage, key)) {
      const langCode = (SupportedLanguage as any)[key];
      languageOptions.push({
        key: langCode,
        text: (LANGUAGE_DISPLAY_NAMES as any)[langCode] || langCode,
      });
    }
  }

  const handleAutoDetectChange = useCallback((_, checked) => {
    setState((prev) => ({
      ...prev,
      autoDetectSource: !!checked,
      sourceLanguage: checked ? undefined : SupportedLanguage.English,
    }));
  }, []);

  const handleSourceLanguageChange = useCallback((_, option) => {
    if (option) {
      setState((prev) => ({
        ...prev,
        sourceLanguage: option.key as string,
      }));
    }
  }, []);

  const handleTargetLanguageChange = useCallback(
    (langCode: string) => (_: any, checked: boolean) => {
      setState((prev) => {
        const exists = prev.selectedTargetLanguages.indexOf(langCode) > -1;
        let next: string[];
        if (checked && !exists) {
          next = prev.selectedTargetLanguages.concat([langCode]);
        } else if (!checked && exists) {
          next = prev.selectedTargetLanguages.filter(
            (lang) => lang !== langCode
          );
        } else {
          next = prev.selectedTargetLanguages;
        }
        return { ...prev, selectedTargetLanguages: next };
      });
    },
    []
  );

  const validateConfiguration = useCallback((): string[] => {
    const errors: string[] = [];

    if (state.selectedTargetLanguages.length === 0) {
      errors.push("Please select at least one target language");
    }

    if (!state.autoDetectSource && !state.sourceLanguage) {
      errors.push("Please select a source language");
    }

    // Check if source and target are the same
    if (
      !state.autoDetectSource &&
      state.sourceLanguage &&
      state.selectedTargetLanguages.indexOf(state.sourceLanguage) > -1
    ) {
      errors.push(
        "Target languages cannot include the source language"
      );
    }

    return errors;
  }, [
    state.selectedTargetLanguages,
    state.autoDetectSource,
    state.sourceLanguage,
  ]);

  useEffect(() => {
    const errors = validateConfiguration();
    setState((prev) => ({ ...prev, validationErrors: errors }));
  }, [validateConfiguration]);

  const handleStartTranslation = async (): Promise<void> => {
    const errors = validateConfiguration();
    if (errors.length > 0) {
      setState((prev) => ({ ...prev, validationErrors: errors }));
      return;
    }

    console.log("Starting translation process...");
    setState((prev) => ({
      ...prev,
      isProcessing: true,
      step: "processing",
      error: undefined,
      jobStatus: undefined,
    }));

    const options: TranslationOptions = {
      sourceLanguage: state.autoDetectSource
        ? undefined
        : state.sourceLanguage,
      targetLanguages: state.selectedTargetLanguages,
    };

    try {
      const result = await translationService.startTranslationJob(
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

      // Start polling for job status
      console.log("Starting job status polling for job:", result.jobId);

      try {
        await translationService.pollJobStatus(
          result.jobId,
          (status) => {
            setState((prev) => ({
              ...prev,
              jobStatus: status,
              isProcessing:
                status.status === "running" || status.status === "pending",
            }));
          },
          3000 // Poll every 3 seconds
        );

        console.log("Translation job polling completed successfully");
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
      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
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
                <Icon
                  iconName="Page"
                  styles={{ root: { color: "#0078d4" } }}
                />
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
          Translation Settings
        </Text>

        <Stack tokens={{ childrenGap: 8 }}>
          <Checkbox
            label="Auto-detect source language"
            checked={state.autoDetectSource}
            onChange={handleAutoDetectChange}
          />

          {!state.autoDetectSource && (
            <Dropdown
              label="Source Language"
              placeholder="Select source language"
              selectedKey={state.sourceLanguage}
              options={languageOptions}
              onChange={handleSourceLanguageChange}
              required
              styles={{ root: { maxWidth: 300 } }}
            />
          )}
        </Stack>

        <Stack tokens={{ childrenGap: 8 }}>
          <Text variant="medium" styles={{ root: { fontWeight: 600 } }}>
            Target Languages *
          </Text>
          <Text variant="small" styles={{ root: { color: "#666" } }}>
            Select one or more languages to translate documents into:
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
            {languageOptions.map((option) => (
              <Checkbox
                key={option.key as string}
                label={option.text}
                checked={
                  state.selectedTargetLanguages.indexOf(
                    option.key as string
                  ) > -1
                }
                onChange={handleTargetLanguageChange(option.key as string)}
                disabled={
                  !state.autoDetectSource &&
                  state.sourceLanguage === option.key
                }
                styles={{
                  root: { marginBottom: 4 },
                  label: { fontSize: 14 },
                }}
              />
            ))}
          </Stack>
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
    const getProgressValue = (): number | undefined => {
      if (!state.jobStatus) {
        return undefined;
      }

      if (
        state.jobStatus.progress === undefined ||
        state.jobStatus.progress === null
      ) {
        return undefined;
      }

      const progress = state.jobStatus.progress;
      const normalizedProgress = progress > 1 ? progress / 100 : progress;

      return normalizedProgress;
    };

    const progressValue = getProgressValue();

    return (
      <Stack tokens={{ childrenGap: 16 }}>
        <Text variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>
          Translating Documents...
        </Text>

        <Stack tokens={{ childrenGap: 8 }}>
          <ProgressIndicator
            percentComplete={progressValue}
            description={
              state.jobStatus?.message ||
              "Initializing translation process..."
            }
            styles={{
              root: { marginBottom: 8 },
            }}
          />
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
            <Text variant="small">
              Total Documents: {state.jobStatus.totalDocuments}
            </Text>
            {state.jobStatus.completedDocuments.length > 0 && (
              <Text variant="small" styles={{ root: { color: "#107c10" } }}>
                Completed: {state.jobStatus.completedDocuments.length}{" "}
                translation(s)
              </Text>
            )}
            {state.jobStatus.failedDocuments.length > 0 && (
              <MessageBar messageBarType={MessageBarType.warning}>
                Failed to translate {state.jobStatus.failedDocuments.length}{" "}
                document(s)
              </MessageBar>
            )}
            {state.jobStatus.totalCharacterCharged > 0 && (
              <Text variant="small" styles={{ root: { color: "#666" } }}>
                Characters processed:{" "}
                {state.jobStatus.totalCharacterCharged.toLocaleString()}
              </Text>
            )}
          </Stack>
        ) : (
          <Stack tokens={{ childrenGap: 4 }}>
            <Text
              variant="small"
              styles={{ root: { color: "#666", fontStyle: "italic" } }}
            >
              Starting translation job...
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

  const renderCompletedStep = (): React.ReactElement => {
    const hasFailures =
      state.jobStatus && state.jobStatus.failedDocuments.length > 0;

    return (
      <Stack tokens={{ childrenGap: 16 }}>
        <MessageBar
          messageBarType={
            hasFailures ? MessageBarType.warning : MessageBarType.success
          }
        >
          {hasFailures
            ? "Translation completed with some errors"
            : "Translation completed successfully!"}
        </MessageBar>

        {state.jobStatus && (
          <Stack tokens={{ childrenGap: 8 }}>
            <Text variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>
              Summary:
            </Text>
            <Text>
              • {state.jobStatus.completedDocuments.length} translation(s)
              completed successfully
            </Text>
            {state.jobStatus.failedDocuments.length > 0 && (
              <Text>
                • {state.jobStatus.failedDocuments.length} translation(s)
                failed
              </Text>
            )}
            <Text>
              • {state.jobStatus.totalCharacterCharged.toLocaleString()}{" "}
              characters processed
            </Text>

            <Text variant="small" styles={{ root: { color: "#666" } }}>
              Translated documents have been saved to the document library with
              "[TRANSLATED]_" prefix.
            </Text>

            {state.jobStatus.completedDocuments.length > 0 && (
              <Stack tokens={{ childrenGap: 4 }}>
                <Text variant="medium" styles={{ root: { fontWeight: 600 } }}>
                  Completed Translations:
                </Text>
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {state.jobStatus.completedDocuments.map(
                    (doc: TranslatedDocument, index: number) => (
                      <Stack
                        key={index}
                        horizontal
                        tokens={{ childrenGap: 8 }}
                        styles={{ root: { padding: 4 } }}
                      >
                        <Icon
                          iconName="CheckMark"
                          styles={{ root: { color: "#107c10" } }}
                        />
                        <Text variant="small">
                          {doc.translatedName} (
                          {(LANGUAGE_DISPLAY_NAMES as any)[
                            doc.targetLanguage
                          ] || doc.targetLanguage}
                          )
                        </Text>
                      </Stack>
                    )
                  )}
                </div>
              </Stack>
            )}

            {state.jobStatus.failedDocuments.length > 0 && (
              <Stack tokens={{ childrenGap: 4 }}>
                <Text variant="medium" styles={{ root: { fontWeight: 600 } }}>
                  Failed Translations:
                </Text>
                <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                  {state.jobStatus.failedDocuments.map((doc, index) => (
                    <Stack
                      key={index}
                      horizontal
                      tokens={{ childrenGap: 8 }}
                      styles={{ root: { padding: 4 } }}
                    >
                      <Icon
                        iconName="StatusErrorFull"
                        styles={{ root: { color: "#a4262c" } }}
                      />
                      <Stack>
                        <Text variant="small">
                          {doc.name} (
                          {(LANGUAGE_DISPLAY_NAMES as any)[
                            doc.targetLanguage
                          ] || doc.targetLanguage}
                          )
                        </Text>
                        <Text
                          variant="small"
                          styles={{ root: { color: "#666" } }}
                        >
                          Error: {doc.error}
                        </Text>
                      </Stack>
                    </Stack>
                  ))}
                </div>
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
    );
  };

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
          text="Start Translation"
          onClick={handleStartTranslation}
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
              Translate Documents
            </Text>
            <Text variant="medium" styles={{ root: { color: "#666" } }}>
              Select target languages for document translation
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
