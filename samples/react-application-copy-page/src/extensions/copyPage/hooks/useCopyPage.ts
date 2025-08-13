/* eslint-disable @rushstack/no-new-null */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import type { ISPFXContext } from '@pnp/sp';
import { PromotedState, spfi, SPFx } from '@pnp/sp/presets/all';
import '@pnp/sp/webs';
import '@pnp/sp/files';
import '@pnp/sp/clientside-pages';
import { MessageBarType } from '@fluentui/react';
import { Logger, LogLevel } from "@pnp/logging";
import {
  getLocalizedTemplatesFolderName,
  knownLocalizedTemplateFolders
} from './useLocalizedTemplatesFolderName';

Logger.activeLogLevel = LogLevel.Warning;

interface Message {
  type: MessageBarType;
  text: string;
}

/**
 * Custom hook to copy a SharePoint page to a target site, with options to save it as a template or publish it.
 * 
 * @param context - The SharePoint Framework (SPFx) context used to interact with the SharePoint environment.
 * @param pageUrl - The URL of the source page to be copied.
 * @param pageName - The name of the new page to be created in the target site.
 * @param targetSiteUrl - The URL of the target site where the page will be copied.
 * 
 * @returns An object containing:
 * - `isSubmitting`: A boolean indicating whether the copy operation is in progress.
 * - `isDone`: A boolean indicating whether the copy operation has completed successfully.
 * - `message`: A message object containing the status or error information of the operation.
 * - `copyPage`: A function to initiate the page copy operation.
 * - `reset`: A function to reset the state of the hook.
 * 
 * ### Usage
 * Call the `copyPage` function with the following parameters:
 * - `isTemplate`: A boolean indicating whether the copied page should be saved as a template.
 * - `publish`: A boolean indicating whether the copied page should be published.
 * - `promotedState`: The promoted state of the copied page (e.g., `PromotedState.Promoted`).
 * 
 * The hook handles the following:
 * - Validates the target site URL.
 * - Copies the page from the source site to the target site.
 * - Optionally saves the copied page as a template in a localized folder.
 * - Publishes the page if specified.
 * - Provides error handling and status updates via the `message` state.
 * 
 * ### Example
 * ```typescript
 * const { copyPage, isSubmitting, message } = useCopyPage(context, pageUrl, pageName, targetSiteUrl);
 * 
 * const handleCopy = async () => {
 *   await copyPage(true, true, PromotedState.Promoted);
 * };
 * ```
 */

// Custom hook to handle copying a SharePoint page to another site
export const useCopyPage = (
  context: ISPFXContext,
  pageUrl: string,
  pageName: string,
  targetSiteUrl: string
): {
  isSubmitting: boolean;
  isDone: boolean;
  message: Message | null;
  copyPage: (isTemplate: boolean, publish: boolean, promotedState: PromotedState) => Promise<void>;
  reset: () => void;
} => {
  const [isSubmitting, setIsSubmitting] = useState(false); // Tracks submission state
  const [isDone, setIsDone] = useState(false); // Tracks completion state
  const [message, setMessage] = useState<Message | null>(null); // Stores status messages

  const copyPage = async (isTemplate: boolean, publish: boolean, promotedState: PromotedState): Promise<void> => {
    if (!targetSiteUrl) {
      setMessage({ type: MessageBarType.warning, text: 'Please select a destination site.' });
      return;
    }

    setIsSubmitting(true); // Start the submission process

    try {
      // Set up SPFI context for source site
      const sourceSP = spfi(context.pageContext.web.absoluteUrl).using(SPFx(context));

      // Load the source client-side page
      const clientPage = await sourceSP.web.loadClientsidePage(pageUrl);

      // Get the page title or use a default
      const pageTitle = clientPage.title || "Copied Page";

      // Set up SPFI context for target site
      const targetSP = spfi(targetSiteUrl).using(SPFx(context));

      // Attempt to copy the page to the target site
      const copiedPage = await clientPage.copy(targetSP.web, pageName, pageTitle, publish, promotedState);
      if (!copiedPage) throw new Error(`Failed to copy the page to ${targetSiteUrl}.`);

      // If copying as a template, move it to the correct folder
      if (isTemplate) {
        // Get new page name from copied page
        /* eslint-disable dot-notation */
        const newPageName = copiedPage['json']?.FileName;
        /* eslint-enable dot-notation */
        if (!newPageName) throw new Error("Copied page does not have a valid name.");

        // Get language and base path for SitePages
        const { Language, ServerRelativeUrl } = await targetSP.web.select("Language", "ServerRelativeUrl")();
        const baseFolderPath = `${ServerRelativeUrl}/SitePages`;
        const preferredFolder = getLocalizedTemplatesFolderName(Language);
        let resolvedFolderName: string | null = null;

        // Helper to check if a folder exists
        const folderExists = async (folderName: string): Promise<boolean> => {
          try {
            await targetSP.web.getFolderByServerRelativePath(`${baseFolderPath}/${folderName}`)();
            return true;
          } catch {
            return false;
          }
        };

        // Check if preferred folder exists
        if (await folderExists(preferredFolder)) {
          resolvedFolderName = preferredFolder;
        } else {
          // Try known localized fallback folder names
          for (const name of knownLocalizedTemplateFolders) {
            if (name === preferredFolder) continue;
            if (await folderExists(name)) {
              resolvedFolderName = name;
              break;
            }
          }

          // No valid folder found
          if (!resolvedFolderName) {
            setMessage({
              type: MessageBarType.error,
              text: `No localized template folder was found in SitePages. Please create a folder like '${preferredFolder}' first.`
            });
            setIsSubmitting(false);
            return;
          }
        }

        // Move the copied page to the correct template folder
        const sourcePagePath = `${baseFolderPath}/${newPageName}`;
        const targetPath = `${baseFolderPath}/${resolvedFolderName}/${pageName}`;

        await targetSP.web.getFileByServerRelativePath(sourcePagePath).moveByPath(targetPath, true);
        Logger.log({ level: LogLevel.Info, message: `Moved copied page to: ${targetPath}` });

        // Set success message for template copy
        setMessage({
          type: MessageBarType.success,
          text: 'Template was saved successfully.'
        });
      }

      // If not a template, set success message for standard copy
      if (!isTemplate) {
        setMessage({ type: MessageBarType.success, text: 'Page copied successfully.' });
      } 
      setIsDone(true);
    } catch (err: any) {
      Logger.error(err);
      setMessage({ type: MessageBarType.error, text: err.message || 'Page copy failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = (): void => {
    setMessage(null);
    setIsDone(false);
    setIsSubmitting(false);
  };

  return {
    isSubmitting,
    isDone,
    message,
    copyPage,
    reset
  };
}
