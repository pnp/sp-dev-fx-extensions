import * as React from 'react';
import type { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import { EditModeDetector } from '../utils/editModeDetector';

const POLL_INTERVAL_MS = 60000;
const COMMAND_BAR_RETRY_MS = 1000;

export function useEditMode(context: ApplicationCustomizerContext | undefined): boolean {
  const [isInEditMode, setIsInEditMode] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!context) {
      return;
    }

    let debounceTimer: number | undefined;
    let intervalTimer: number | undefined;

    const checkEditMode = (): boolean => {
      const next = EditModeDetector.isPageInEditMode(context);
      setIsInEditMode((prev) => prev !== next ? next : prev);
      return next;
    };

    const debouncedCheckEditMode = (): void => {
      if (debounceTimer !== undefined) {
        window.clearTimeout(debounceTimer);
      }
      debounceTimer = window.setTimeout(() => {
        debounceTimer = undefined;
        checkEditMode();
      }, 50);
    };

    const observer = new MutationObserver(debouncedCheckEditMode);

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: false
    });

    const observeCommandBar = (): void => {
      const commandBar = document.querySelector('[data-automation-id="pageCommandBarRegion"]');
      if (commandBar) {
        observer.observe(commandBar, {
          childList: true,
          subtree: true
        });
      }
    };

    observeCommandBar();
    const retryTimer = window.setTimeout(observeCommandBar, COMMAND_BAR_RETRY_MS);

    const currentlyInEditMode = checkEditMode();

    if (!currentlyInEditMode) {
      intervalTimer = window.setInterval(() => {
        const next = checkEditMode();
        if (next && intervalTimer !== undefined) {
          window.clearInterval(intervalTimer);
          intervalTimer = undefined;
        }
      }, POLL_INTERVAL_MS);
    }

    return () => {
      if (debounceTimer !== undefined) {
        window.clearTimeout(debounceTimer);
      }
      if (intervalTimer !== undefined) {
        window.clearInterval(intervalTimer);
      }
      window.clearTimeout(retryTimer);
      observer.disconnect();
    };
  }, [context]);

  return isInEditMode;
}