import type { ApplicationCustomizerContext } from '@microsoft/sp-application-base';

export class EditModeDetector {
  public static isPageInEditMode(context?: ApplicationCustomizerContext): boolean {
    try {
      if (context) {
        const legacy = (context.pageContext.legacyPageContext ?? {}) as Record<string, unknown>;

        if (typeof legacy.isPageInEditMode === 'boolean') {
          return legacy.isPageInEditMode;
        }
        if (typeof legacy.isEditMode === 'boolean') {
          return legacy.isEditMode;
        }

        const formContext = legacy.formContext as { displayMode?: string } | undefined;
        if (formContext?.displayMode && String(formContext.displayMode).toLowerCase() === 'edit') {
          return true;
        }

        if (typeof legacy.pageMode === 'string' && legacy.pageMode.toLowerCase() === 'edit') {
          return true;
        }
      }

      if (typeof window === 'undefined') {
        return false;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const modeParam = urlParams.get('Mode') || urlParams.get('mode');
      const displayModeParam = urlParams.get('displaymode') || urlParams.get('DisplayMode');

      if ((modeParam && modeParam.toLowerCase() === 'edit') || (displayModeParam && displayModeParam.toLowerCase() === 'edit')) {
        return true;
      }

      const bodyClasses = document.body.className;
      const editModeClasses = [
        'SPPageInEditMode',
        'ms-webpart-chrome-editing',
        'CanvasComponent-inEditMode',
        'od-EditMode',
        'SPCanvas--editing',
        'sp-edit-mode',
        'sp-editing',
        'ms-EditMode',
        'is-edit-mode'
      ];

      const foundEditClass = editModeClasses.find((cls) => bodyClasses.indexOf(cls) >= 0);
      if (foundEditClass) {
        return true;
      }

      const spInfo = (window as unknown as Record<string, Record<string, unknown>>)._spPageContextInfo;
      if (spInfo) {
        if (spInfo.isPageInEditMode === true || spInfo.isEditMode === true) {
          return true;
        }
        if (typeof spInfo.pageMode === 'string' && spInfo.pageMode.toLowerCase() === 'edit') {
          return true;
        }
      }

      if (document.querySelector('[data-sp-feature-tag="Site Pages Editing"]')) {
        return true;
      }

      const commandBarSelectors = [
        '[data-automation-id="pageCommandBarRegion"]',
        '[data-automation-id="pageCommandBar"]',
        '[data-automation-id="PageCommandBar"]',
        '[data-automation-id="CommandBar"]'
      ];

      for (const selector of commandBarSelectors) {
        const editButtons = document.querySelector(selector);
        if (!editButtons) { continue; }
        const saveButton = editButtons.querySelector('button[title*="Save"]')
          || editButtons.querySelector('button[aria-label*="Save"]');
        const publishButton = editButtons.querySelector('button[title*="Publish"]')
          || editButtons.querySelector('button[aria-label*="Publish"]');
        const discardButton = editButtons.querySelector('button[title*="Discard"]')
          || editButtons.querySelector('button[aria-label*="Discard"]')
          || editButtons.querySelector('button[title*="Cancel"]');
        if (saveButton || publishButton || discardButton) {
          return true;
        }
      }

      const contentEditable = document.querySelector('[contenteditable="true"][data-sp-rte]')
        || document.querySelector('[contenteditable="true"][role="textbox"]');
      if (contentEditable) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }
}