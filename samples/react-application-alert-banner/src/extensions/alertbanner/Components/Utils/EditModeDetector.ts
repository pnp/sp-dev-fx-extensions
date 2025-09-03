/**
 * Utility to detect if SharePoint page is in edit mode
 */
import { logger } from '../Services/LoggerService';
export class EditModeDetector {
  /**
   * Check if the current SharePoint page is in edit mode
   */
  public static isPageInEditMode(): boolean {
    try {
      // Method 1: Check for edit mode indicators in URL
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('Mode') === 'Edit' || urlParams.get('displaymode') === 'edit') {
        return true;
      }

      // Method 2: Check for edit mode CSS classes on the body
      const bodyClasses = document.body.className;
      if (bodyClasses.includes('SPPageInEditMode') || 
          bodyClasses.includes('ms-webpart-chrome-editing') ||
          bodyClasses.includes('CanvasComponent-inEditMode')) {
        return true;
      }

      // Method 3: Check for SharePoint edit mode data attributes
      const spPageDiv = document.querySelector('[data-sp-feature-tag="Site Pages Editing"]');
      if (spPageDiv) {
        return true;
      }

      // Method 4: Check for canvas editing indicators (Modern pages)
      const canvasEditingElements = document.querySelectorAll(
        '.CanvasComponent[data-sp-canvascontrol]'
      );
      if (canvasEditingElements.length > 0) {
        for (let i = 0; i < canvasEditingElements.length; i++) {
          const element = canvasEditingElements[i] as HTMLElement;
          if (element.style.outline || element.dataset.spCanvascontrol === 'editing') {
            return true;
          }
        }
      }

      // Method 5: Check for web part maintenance mode
      const maintenanceIndicators = document.querySelectorAll(
        '.ms-webpartPage-root[data-automation-id="pageHeader"]'
      );
      if (maintenanceIndicators.length > 0) {
        return true;
      }

      // Method 6: Check for presence of "Save" and "Cancel" buttons (modern pages)
      const editButtons = document.querySelector('[data-automation-id="pageCommandBarRegion"]');
      if (editButtons) {
        const saveButton = editButtons.querySelector('button[title*="Save"]') ||
                          editButtons.querySelector('button[aria-label*="Save"]');
        const publishButton = editButtons.querySelector('button[title*="Publish"]') ||
                             editButtons.querySelector('button[aria-label*="Publish"]');
        
        if (saveButton || publishButton) {
          return true;
        }
      }

      // Method 7: Check SharePoint context (if available)
      // @ts-ignore - SharePoint global context
      if (typeof window._spPageContextInfo !== 'undefined') {
        // @ts-ignore
        const webUIVersion = window._spPageContextInfo.webUIVersion;
        if (webUIVersion && webUIVersion === 15) {
          // Classic SharePoint - check for edit mode
          // @ts-ignore
          if (window.MSOLayout_InDesignMode || window.g_disableCheckoutInEditMode === false) {
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      logger.warn('EditModeDetector', 'Error detecting edit mode', error);
      return false;
    }
  }

  /**
   * Set up a listener to detect when edit mode changes
   */
  public static onEditModeChange(callback: (isEditMode: boolean) => void): () => void {
    let currentEditMode = EditModeDetector.isPageInEditMode();
    
    const checkForChanges = () => {
      const newEditMode = EditModeDetector.isPageInEditMode();
      if (newEditMode !== currentEditMode) {
        currentEditMode = newEditMode;
        callback(newEditMode);
      }
    };

    // Check for URL changes (SPA navigation)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(checkForChanges, 100);
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(checkForChanges, 100);
    };

    // Listen for popstate events
    const popstateListener = () => {
      setTimeout(checkForChanges, 100);
    };
    window.addEventListener('popstate', popstateListener);

    // Monitor DOM changes for dynamic content
    const observer = new MutationObserver(() => {
      checkForChanges();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'data-sp-feature-tag', 'data-automation-id']
    });

    // Initial check
    setTimeout(checkForChanges, 1000);

    // Return cleanup function
    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', popstateListener);
      observer.disconnect();
    };
  }
}