import { override } from "@microsoft/decorators";
import { Log } from "@microsoft/sp-core-library";
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters,
  ListViewStateChangedEventArgs,
} from "@microsoft/sp-listview-extensibility";
import { Dialog } from "@microsoft/sp-dialog";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { TranslationDialog } from "./components/TranslationDialog";
import { FileValidationService } from "../../services/FileValidationService";
import { ITranslationServiceConfig } from "../../services/TranslationService";
import { DocumentInfo } from "../../models/TranslationModels";

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IDocumentTranslationCommandSetProperties {
  azureFunctionUrl?: string;
  clientId?: string; // Application ID URI or API scope for the Azure Function
  functionKey?: string;
  enabledFileTypes?: string[];
  maxFileSize?: number;
  maxFilesPerJob?: number;
}

const LOG_SOURCE: string = "DocumentTranslationCommandSet";

export default class DocumentTranslationCommandSet extends BaseListViewCommandSet<IDocumentTranslationCommandSetProperties> {
  private _translateCommand: Command;
  private _dialogContainer: HTMLElement | null = null;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, "Initialized DocumentTranslationCommandSet");
    // Initialize the command
    this._translateCommand = this.tryGetCommand("TRANSLATE_DOCUMENT");
    if (this._translateCommand) {
      // Check if the command should be visible
      this._translateCommand.visible = this._shouldShowCommand();
    }

    // Listen for list view state changes to update command visibility
    this.context.listView.listViewStateChangedEvent.add(
      this,
      this._onListViewStateChanged
    );

    return Promise.resolve();
  }

  @override
  public onListViewUpdated(
    event: IListViewCommandSetListViewUpdatedParameters
  ): void {
    if (this._translateCommand) {
      this._translateCommand.visible = this._shouldShowCommand();
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case "TRANSLATE_DOCUMENT":
        // Handle promise with rejection handler to satisfy linting
        this._executeTranslationCommand().catch((err) => {
          Log.error(LOG_SOURCE, err, this.context.serviceScope);
        });
        break;
      default:
        throw new Error("Unknown command");
    }
  }

  private _onListViewStateChanged = (
    args: ListViewStateChangedEventArgs
  ): void => {
    Log.info(LOG_SOURCE, "List view state changed");
    if (this._translateCommand) {
      this._translateCommand.visible = this._shouldShowCommand();
    }
  };

  private _shouldShowCommand(): boolean {
    // Check if we're in a document library
    if (!this._isDocumentLibrary()) {
      return false;
    }

    // Check if any items are selected
    const selectedRows = this.context.listView.selectedRows;
    if (!selectedRows || selectedRows.length === 0) {
      return false;
    }

    // Validate selected items
    const documents = FileValidationService.validateSelectedItems(selectedRows);
    const supportedDocuments = documents.filter((doc) => doc.isSupported);

    // Show command if at least one supported document is selected
    return supportedDocuments.length > 0;
  }

  private _isDocumentLibrary(): boolean {
    const list = this.context.pageContext.list;
    if (!list) return false;

    // Assume document library when on a list page and ListView is present
    return true;
  }

  private async _executeTranslationCommand(): Promise<void> {
    try {
      const selectedRows = this.context.listView.selectedRows;
      if (!selectedRows || selectedRows.length === 0) {
        await Dialog.alert("Please select at least one document to translate.");
        return;
      }

      // Validate configuration
      const config = this._getTranslationConfig();
      if (!config.azureFunctionUrl || !config.clientId) {
        await Dialog.alert(
          "Document Translation service is not configured properly. Please contact your administrator to ensure both Azure Function URL and API scope (clientId) are configured."
        );
        return;
      }

      // Validate selected documents
      const documents =
        FileValidationService.validateSelectedItems(selectedRows);
      const supportedDocuments = documents.filter((doc) => doc.isSupported);
      const unsupportedDocuments = documents.filter((doc) => !doc.isSupported);

      if (supportedDocuments.length === 0) {
        const reasons = unsupportedDocuments
          .map((doc) => `• ${doc.name}: ${doc.errorMessage}`)
          .join("\n");

        await Dialog.alert(
          `No supported documents found for translation.\n\nReasons:\n${reasons}`
        );
        return;
      }

      // Check file limits
      const maxFiles = this.properties.maxFilesPerJob || 50;
      if (supportedDocuments.length > maxFiles) {
        await Dialog.alert(
          `You can only translate up to ${maxFiles} documents at once. Please select fewer documents.`
        );
        return;
      }

      // Show warnings for unsupported files
      if (unsupportedDocuments.length > 0) {
        const warningMessage =
          `${unsupportedDocuments.length} file(s) will be skipped:\n\n` +
          unsupportedDocuments
            .map((doc) => `• ${doc.name}: ${doc.errorMessage}`)
            .join("\n") +
          `\n\nContinuing with ${supportedDocuments.length} supported file(s).`;
        await Dialog.alert(warningMessage);
      }

      // Show translation dialog
      this._showTranslationDialog(supportedDocuments, config);
    } catch (error) {
      Log.error(LOG_SOURCE, error, this.context.serviceScope);
      await Dialog.alert(
        `An error occurred: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private _showTranslationDialog(
    documents: DocumentInfo[],
    config: ITranslationServiceConfig
  ): void {
    // Create container if it doesn't exist
    if (!this._dialogContainer) {
      this._dialogContainer = document.createElement("div");
      document.body.appendChild(this._dialogContainer);
    }

    // Render the dialog
    const element = React.createElement(TranslationDialog, {
      context: this.context,
      documents: documents,
      config: config,
      isOpen: true,
      onClose: () => this._closeTranslationDialog(),
    });

    ReactDOM.render(element, this._dialogContainer);
  }

  private _closeTranslationDialog(): void {
    if (this._dialogContainer) {
      ReactDOM.unmountComponentAtNode(this._dialogContainer);
      document.body.removeChild(this._dialogContainer);
      this._dialogContainer = null;
    }
  }

  private _getTranslationConfig(): ITranslationServiceConfig {
    console.log("Getting translation config...");
    console.log("Properties object:", this.properties);
    console.log(
      "Azure Function URL from properties:",
      this.properties.azureFunctionUrl
    );
    console.log("Client ID from properties:", this.properties.clientId);

    const config = {
      azureFunctionUrl: this.properties.azureFunctionUrl || "",
      clientId: this.properties.clientId || "",
      functionKey: this.properties.functionKey,
    };

    console.log("Final config:", config);
    return config;
  }

  protected onDispose(): void {
    if (this.context.listView.listViewStateChangedEvent) {
      this.context.listView.listViewStateChangedEvent.remove(
        this,
        this._onListViewStateChanged
      );
    }
    super.onDispose();
  }
}
